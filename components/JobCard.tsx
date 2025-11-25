import Link from 'next/link';
import { IJob } from '@/models/Job';

interface JobCardProps {
  job: IJob;
}

export default function JobCard({ job }: JobCardProps) {
  const formatSalary = () => {
    if (!job.salary) return null;
    const { min, max, currency = 'EUR' } = job.salary;
    if (min && max) {
      return `${min}€ - ${max}€`;
    }
    if (min) {
      return `À partir de ${min}€`;
    }
    return null;
  };

  return (
    <Link href={`/jobs/${job._id}`}>
      <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700 transform hover:-translate-y-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {job.title}
              </h3>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{job.company}</p>
            </div>
            <span className="px-4 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md">
              {job.type}
            </span>
          </div>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{job.location}</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{job.experience}</span>
          </div>
          {formatSalary() && (
            <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatSalary()}</span>
            </div>
          )}
        </div>
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.slice(0, 5).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-200 rounded-full shadow-sm"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 5 && (
                <span className="px-3 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                  +{job.skills.length - 5}
                </span>
              )}
            </div>
          )}
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
            {job.description}
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300 inline-flex items-center">
              Voir les détails
              <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

