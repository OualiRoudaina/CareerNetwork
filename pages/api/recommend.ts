import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Job from '@/models/Job';
import mongoose from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  try {
    const user = await User.findById(session.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userSkills = user.profile.skills || [];
    const userEducation = user.profile.education || [];
    const userExperience = user.profile.experience || [];
    const userLanguages = user.profile.languages || [];
    const userCertifications = user.profile.certifications || [];

    // Préparer les données pour l'API IA
    const skillsText = Array.isArray(userSkills) ? userSkills.join(', ') : String(userSkills || '');
    const educationText = Array.isArray(userEducation) 
      ? userEducation.map((edu: any) => `${edu.degree || ''} ${edu.field || ''} ${edu.school || ''}`).join(', ')
      : String(userEducation || '');
    const experienceText = Array.isArray(userExperience)
      ? userExperience.map((exp: any) => `${exp.title || ''} ${exp.company || ''} ${exp.description || ''}`).join(', ')
      : String(userExperience || '');
    const languagesText = Array.isArray(userLanguages)
      ? userLanguages.map((lang: any) => `${lang.name || ''} ${lang.level || ''}`).join(', ')
      : String(userLanguages || '');
    const certificationsText = Array.isArray(userCertifications)
      ? userCertifications.map((cert: any) => `${cert.name || ''} ${cert.issuer || ''}`).join(', ')
      : String(userCertifications || '');
    const locationText = `${user.profile.city || ''} ${user.profile.country || ''}`.trim();

    // Appel à l'API IA pour les recommandations
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    let recommendedJobs: any[] = [];
    let aiRecommendations: any[] = [];
    let mlServiceUsed = false;

    try {
      console.log('Attempting to call ML service at:', mlServiceUrl);
      
      // Check ML service health first (quick check)
      try {
        const healthController = new AbortController();
        const healthTimeout = setTimeout(() => healthController.abort(), 3000); // 3 second timeout for health check
        
        const healthResponse = await fetch(`${mlServiceUrl}/`, {
          signal: healthController.signal,
        });
        clearTimeout(healthTimeout);
        
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          if (!healthData.model_loaded || healthData.jobs_count === 0) {
            console.warn('ML Service health check: Model not loaded or no jobs available. Using fallback.');
            throw new Error('ML Service not ready');
          }
          console.log('ML Service health check passed. Model loaded:', healthData.model_loaded, 'Jobs:', healthData.jobs_count);
        }
      } catch (healthError: any) {
        if (healthError.name !== 'AbortError') {
          console.warn('ML Service health check failed, skipping ML service:', healthError.message);
        }
        throw new Error('ML Service not available');
      }
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      console.log('=== CALLING ML SERVICE ===');
      console.log('ML Service URL:', mlServiceUrl);
      console.log('Request body:', {
        skills: skillsText,
        experience: experienceText.substring(0, 50) + '...',
        education: educationText.substring(0, 50) + '...',
        location: locationText,
      });

      const aiResponse = await fetch(`${mlServiceUrl}/api/recommend?top_n=10`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: skillsText,
          experience: experienceText,
          education: educationText,
          location: locationText,
          contract_type: '',
          languages: languagesText,
          certifications: certificationsText,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log('ML Service Response Status:', aiResponse.status, aiResponse.statusText);

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const rawRecommendations = aiData.recommendations || [];
        
        console.log('=== ML SERVICE RESPONSE DEBUG ===');
        console.log('Raw recommendations from ML (before filtering):', rawRecommendations.length);
        if (rawRecommendations.length > 0) {
          console.log('First recommendation sample:', JSON.stringify(rawRecommendations[0], null, 2));
          console.log('Has skill_match_percentage?', rawRecommendations[0].skill_match_percentage !== undefined);
          console.log('skill_match_percentage value:', rawRecommendations[0].skill_match_percentage);
          console.log('Has matching_skills?', rawRecommendations[0].matching_skills !== undefined);
          console.log('matching_skills value:', rawRecommendations[0].matching_skills);
          console.log('matching_skills length:', rawRecommendations[0].matching_skills?.length || 0);
        } else {
          console.log('WARNING: ML Service returned 0 recommendations!');
          console.log('Full response:', JSON.stringify(aiData, null, 2));
        }
        console.log('================================');
        
        // Filtrer les recommandations avec 0 compétences correspondantes
        aiRecommendations = rawRecommendations.filter((rec: any) => {
          const hasMatchingSkills = rec.matching_skills && rec.matching_skills.length > 0;
          const hasSkillMatch = rec.skill_match_percentage && rec.skill_match_percentage > 0;
          const shouldKeep = hasMatchingSkills || hasSkillMatch;
          
          if (!shouldKeep) {
            console.log('Filtering out recommendation:', {
              job_id: rec.job_id,
              job_role: rec.job_role,
              company: rec.company,
              hasMatchingSkills,
              hasSkillMatch,
              matching_skills: rec.matching_skills,
              skill_match_percentage: rec.skill_match_percentage,
            });
          }
          
          return shouldKeep;
        });
        
        console.log('ML Service returned', aiRecommendations.length, 'recommendations (after filtering)');
        if (rawRecommendations.length > 0 && aiRecommendations.length === 0) {
          console.log('WARNING: All recommendations were filtered out!');
          console.log('This might indicate the filtering is too strict or the ML service data format changed.');
        }

        // Essayer d'abord avec les job_id si disponibles (pour MongoDB)
        const jobIds = aiRecommendations
          .map((rec: any) => rec.job_id)
          .filter((id: any) => id && id !== 'null' && id !== '' && id !== 'None');
        
        console.log('Found', jobIds.length, 'valid job IDs from ML service');
        
        if (jobIds.length > 0) {
          // Convertir les IDs en ObjectId pour MongoDB
          const objectIds = jobIds
            .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
            .map((id: string) => new mongoose.Types.ObjectId(id));
          
          console.log('Valid ObjectIds:', objectIds.length);
          
          if (objectIds.length > 0) {
            recommendedJobs = await Job.find({
              _id: { $in: objectIds },
              isActive: true,
            }).limit(10);

            console.log('Found', recommendedJobs.length, 'jobs by ID in MongoDB');

            // Fusionner les données du ML avec les jobs MongoDB
            console.log('=== MERGING ML DATA WITH JOBS ===');
            recommendedJobs = recommendedJobs.map((job: any) => {
              const mlData = aiRecommendations.find((r: any) => r.job_id === job._id.toString());
              console.log(`Job ${job._id}:`, {
                foundMLData: !!mlData,
                jobId: job._id.toString(),
                mlJobId: mlData?.job_id,
                skillMatchPercentage: mlData?.skill_match_percentage,
                matchingSkills: mlData?.matching_skills,
              });
              
              if (mlData) {
                // Ajouter les données du ML au job
                const mergedJob = {
                  ...job.toObject(),
                  mlScore: mlData.score,
                  skillMatchPercentage: mlData.skill_match_percentage,
                  matchingSkills: mlData.matching_skills || [],
                  missingSkills: mlData.missing_skills || [],
                  explanation: mlData.explanation,
                };
                console.log(`Merged job ${job._id} with ML data:`, {
                  skillMatchPercentage: mergedJob.skillMatchPercentage,
                  matchingSkillsCount: mergedJob.matchingSkills.length,
                });
                return mergedJob;
              }
              console.log(`No ML data found for job ${job._id}`);
              return job;
            });
            console.log('=== MERGE COMPLETE ===');

            // Trier selon l'ordre des scores de l'IA
            recommendedJobs.sort((a: any, b: any) => {
              const scoreA = a.mlScore || aiRecommendations.find((r: any) => r.job_id === a._id.toString())?.score || 0;
              const scoreB = b.mlScore || aiRecommendations.find((r: any) => r.job_id === b._id.toString())?.score || 0;
              return scoreB - scoreA;
            });
            
            if (recommendedJobs.length > 0) {
              mlServiceUsed = true;
            }
          }
        }
        
        // Si pas de résultats avec les IDs, chercher par nom de compagnie et titre
        if (recommendedJobs.length === 0 && aiRecommendations.length > 0) {
          console.log('Trying to match by company/job_role...');
          const companyNames = aiRecommendations.map((r: any) => r.company).filter(Boolean);
          const jobRoles = aiRecommendations.map((r: any) => r.job_role).filter(Boolean);
          
          console.log('Company names:', companyNames);
          console.log('Job roles:', jobRoles);
          
          if (companyNames.length > 0 || jobRoles.length > 0) {
            const query: any = { isActive: true };
            const orConditions: any[] = [];
            
            if (companyNames.length > 0) {
              orConditions.push({ company: { $in: companyNames } });
            }
            if (jobRoles.length > 0) {
              orConditions.push({ title: { $in: jobRoles } });
              orConditions.push({ description: { $regex: jobRoles.join('|'), $options: 'i' } });
            }
            
            if (orConditions.length > 0) {
              query.$or = orConditions;
              recommendedJobs = await Job.find(query).limit(10);
              console.log('Found', recommendedJobs.length, 'jobs by company/job_role');
              
              // Fusionner les données du ML et trier par score
              if (recommendedJobs.length > 0) {
                mlServiceUsed = true;
                recommendedJobs = recommendedJobs.map((job: any) => {
                  const mlData = aiRecommendations.find((r: any) => 
                    r.company === job.company || r.job_role === job.title
                  );
                  if (mlData) {
                    return {
                      ...job.toObject(),
                      mlScore: mlData.score,
                      skillMatchPercentage: mlData.skill_match_percentage,
                      matchingSkills: mlData.matching_skills || [],
                      missingSkills: mlData.missing_skills || [],
                      explanation: mlData.explanation,
                    };
                  }
                  return job;
                });
                recommendedJobs.sort((a: any, b: any) => {
                  const scoreA = a.mlScore || 0;
                  const scoreB = b.mlScore || 0;
                  return scoreB - scoreA;
                });
              }
            }
          }
        }
      } else {
        console.warn('ML Service returned error:', aiResponse.status, aiResponse.statusText);
        if (aiResponse.status === 503) {
          console.warn('ML Service unavailable (503) - Model may not be loaded. Using fallback.');
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('ML Service request timed out after 10 seconds. Using fallback.');
      } else {
        console.warn('ML Service unavailable, falling back to basic recommendations:', error.message);
      }
    }

    // Fallback: Si l'API IA n'est pas disponible ou ne retourne pas de résultats, utiliser la logique basique
    if (recommendedJobs.length === 0) {
      console.log('Using fallback recommendation logic...');
      
      // First, check if there are any active jobs at all
      const totalActiveJobs = await Job.countDocuments({ isActive: true });
      console.log('Total active jobs in database:', totalActiveJobs);
      
      if (totalActiveJobs === 0) {
        console.log('No active jobs found in database');
        return res.status(200).json({
          message: 'No active jobs available',
          jobs: [],
          profile: {
            skills: userSkills,
            education: userEducation,
            experience: userExperience,
          },
          debug: {
            mlServiceUsed: false,
            aiRecommendationsCount: 0,
            finalJobsCount: 0,
            totalActiveJobs: 0,
          },
        });
      }

      let query: any = { isActive: true };

      // D'abord, essayer avec les compétences exactes
      if (userSkills && userSkills.length > 0) {
        query.skills = { $in: userSkills };
        const jobsWithSkills = await Job.find(query).limit(10);
        
        // Filtrer pour ne garder que ceux qui ont au moins une compétence correspondante
        recommendedJobs = jobsWithSkills.filter((job: any) => {
          const jobSkills = Array.isArray(job.skills) ? job.skills : [];
          const userSkillsArray = Array.isArray(userSkills) ? userSkills : [];
          const matchingSkills = jobSkills.filter((skill: string) => 
            userSkillsArray.some((userSkill: string) => 
              skill.toLowerCase().includes(userSkill.toLowerCase()) || 
              userSkill.toLowerCase().includes(skill.toLowerCase())
            )
          );
          return matchingSkills.length > 0;
        });
        
        console.log('Found', recommendedJobs.length, 'jobs matching skills exactly');
      }

      // Si pas assez de résultats, élargir avec recherche textuelle
      if (recommendedJobs.length < 10) {
        const searchTerms = [
          ...(Array.isArray(userSkills) ? userSkills : []),
          ...(skillsText ? skillsText.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : []),
        ].filter(Boolean);
        
        if (searchTerms.length > 0) {
          const searchRegex = searchTerms.join('|');
          const expandedQuery = {
            isActive: true,
            $or: [
              { title: { $regex: searchRegex, $options: 'i' } },
              { description: { $regex: searchRegex, $options: 'i' } },
              { skills: { $in: searchTerms } },
            ],
          };
          const expandedJobs = await Job.find(expandedQuery).limit(10);
          
          // Combiner avec les jobs déjà trouvés (sans doublons)
          const existingIds = new Set(recommendedJobs.map((j: any) => j._id.toString()));
          const newJobs = expandedJobs.filter((j: any) => !existingIds.has(j._id.toString()));
          recommendedJobs = [...recommendedJobs, ...newJobs].slice(0, 10);
          console.log('Found', recommendedJobs.length, 'jobs with expanded search');
        }
      }

      // Si toujours pas assez de résultats, chercher des jobs avec au moins une compétence correspondante
      if (recommendedJobs.length < 10 && userSkills && userSkills.length > 0) {
        console.log('Searching for jobs with at least one matching skill...');
        const existingIds = new Set(recommendedJobs.map((j: any) => j._id.toString()));
        
        const userSkillsArray = Array.isArray(userSkills) ? userSkills : [];
        const searchTerms = userSkillsArray.map((s: string) => s.trim().toLowerCase()).filter((s: string) => s.length > 0);
        
        if (searchTerms.length > 0) {
          const searchRegex = searchTerms.join('|');
          let additionalQuery: any = {
            isActive: true,
            $or: [
              { skills: { $in: userSkillsArray } },
              { title: { $regex: searchRegex, $options: 'i' } },
              { description: { $regex: searchRegex, $options: 'i' } },
            ],
          };
          
          if (existingIds.size > 0) {
            additionalQuery._id = { $nin: Array.from(existingIds).map((id: string) => new mongoose.Types.ObjectId(id)) };
          }
          
          const additionalJobs = await Job.find(additionalQuery)
            .sort({ createdAt: -1 })
            .limit(10 - recommendedJobs.length);
          
          // Filtrer pour ne garder que ceux qui ont au moins une compétence correspondante
          const filteredAdditionalJobs = additionalJobs.filter((job: any) => {
            const jobSkills = Array.isArray(job.skills) ? job.skills : [];
            const matchingSkills = jobSkills.filter((skill: string) => 
              userSkillsArray.some((userSkill: string) => 
                skill.toLowerCase().includes(userSkill.toLowerCase()) || 
                userSkill.toLowerCase().includes(skill.toLowerCase())
              )
            );
            // Vérifier aussi dans le titre et la description
            const titleMatch = searchTerms.some(term => 
              job.title?.toLowerCase().includes(term)
            );
            const descMatch = searchTerms.some(term => 
              job.description?.toLowerCase().includes(term)
            );
            return matchingSkills.length > 0 || titleMatch || descMatch;
          });
          
          console.log('Found', filteredAdditionalJobs.length, 'additional jobs with matching skills');
          recommendedJobs = [...recommendedJobs, ...filteredAdditionalJobs].slice(0, 10);
        }
      }
      
      // Si toujours pas de résultats, retourner un message plutôt que des jobs sans correspondance
      if (recommendedJobs.length === 0) {
        console.log('No jobs found with matching skills');
        return res.status(200).json({
          message: 'Aucune offre trouvée correspondant à vos compétences. Veuillez mettre à jour votre profil avec plus de compétences.',
          jobs: [],
          profile: {
            skills: userSkills,
            education: userEducation,
            experience: userExperience,
          },
          debug: {
            mlServiceUsed: false,
            aiRecommendationsCount: 0,
            finalJobsCount: 0,
            totalActiveJobs: await Job.countDocuments({ isActive: true }),
          },
        });
      }
    }

    console.log('=== FINAL RESPONSE DEBUG ===');
    console.log('Final recommendations count:', recommendedJobs.length);
    console.log('ML Service used:', mlServiceUsed);
    
    // Vérifier les données finales
    if (recommendedJobs.length > 0) {
      console.log('First job in final response:', {
        _id: recommendedJobs[0]._id,
        title: recommendedJobs[0].title,
        hasSkillMatchPercentage: (recommendedJobs[0] as any).skillMatchPercentage !== undefined,
        skillMatchPercentage: (recommendedJobs[0] as any).skillMatchPercentage,
        hasMatchingSkills: (recommendedJobs[0] as any).matchingSkills !== undefined,
        matchingSkills: (recommendedJobs[0] as any).matchingSkills,
      });
    }
    console.log('===========================');
    
    const totalActiveJobs = await Job.countDocuments({ isActive: true });

    return res.status(200).json({
      message: `Recommendations generated${mlServiceUsed ? ' (AI-powered)' : ' (fallback)'}`,
      jobs: recommendedJobs,
      profile: {
        skills: userSkills,
        education: userEducation,
        experience: userExperience,
      },
      debug: {
        mlServiceUsed,
        aiRecommendationsCount: aiRecommendations.length,
        finalJobsCount: recommendedJobs.length,
        totalActiveJobs,
        sampleJob: recommendedJobs.length > 0 ? {
          hasSkillMatchPercentage: (recommendedJobs[0] as any).skillMatchPercentage !== undefined,
          skillMatchPercentage: (recommendedJobs[0] as any).skillMatchPercentage,
        } : null,
      },
    });
  } catch (error: any) {
    console.error('Recommendation error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
}

