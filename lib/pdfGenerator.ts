// Client-side PDF generator using jsPDF
// This will be used in the browser to generate PDFs

export interface CVData {
  name: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  skills: string[];
  education: {
    degree: string;
    school: string;
    year: number;
    field?: string;
    description?: string;
  }[];
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
  }[];
  languages: {
    name: string;
    level: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
  }[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }[];
}

export async function generateCVPDF(data: CVData): Promise<Blob> {
  // Dynamic import of jsPDF to avoid SSR issues
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    if (!text) return y;
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * (fontSize * 0.4);
  };

  // Helper function to add section title
  const addSectionTitle = (title: string, y: number) => {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(title, margin, y);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    return y + 8;
  };

  // Header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text(data.name, margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const contactInfo = [
    data.email,
    data.phone,
    data.address,
  ].filter(Boolean).join(' | ');
  doc.text(contactInfo, margin, yPosition);
  yPosition += 10;

  // Summary
  if (data.summary) {
    yPosition = addSectionTitle('Résumé professionnel', yPosition);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPosition = addText(data.summary, margin, yPosition, maxWidth) + 5;
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    yPosition = addSectionTitle('Compétences', yPosition);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const skillsText = data.skills.join(' • ');
    yPosition = addText(skillsText, margin, yPosition, maxWidth) + 5;
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    yPosition = addSectionTitle('Expérience professionnelle', yPosition);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    data.experience.forEach((exp) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont(undefined, 'bold');
      yPosition = addText(`${exp.title} - ${exp.company}`, margin, yPosition, maxWidth, 11) + 2;
      
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      const dateInfo = exp.current 
        ? `${exp.startDate || ''} - Présent`
        : `${exp.startDate || ''} - ${exp.endDate || exp.duration}`;
      yPosition = addText(dateInfo, margin, yPosition, maxWidth, 9) + 2;
      
      doc.setFontSize(10);
      if (exp.description) {
        yPosition = addText(exp.description, margin, yPosition, maxWidth) + 3;
      }
    });
    yPosition += 5;
  }

  // Education
  if (data.education && data.education.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    yPosition = addSectionTitle('Formation', yPosition);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    data.education.forEach((edu) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont(undefined, 'bold');
      const eduTitle = `${edu.degree}${edu.field ? ` - ${edu.field}` : ''}`;
      yPosition = addText(eduTitle, margin, yPosition, maxWidth, 11) + 2;
      
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      yPosition = addText(`${edu.school} - ${edu.year}`, margin, yPosition, maxWidth, 9) + 2;
      
      if (edu.description) {
        doc.setFontSize(10);
        yPosition = addText(edu.description, margin, yPosition, maxWidth) + 3;
      }
    });
    yPosition += 5;
  }

  // Languages
  if (data.languages && data.languages.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    yPosition = addSectionTitle('Langues', yPosition);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    const languagesText = data.languages.map(lang => `${lang.name} (${lang.level})`).join(' • ');
    yPosition = addText(languagesText, margin, yPosition, maxWidth) + 5;
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    yPosition = addSectionTitle('Certifications', yPosition);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    data.certifications.forEach((cert) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont(undefined, 'bold');
      yPosition = addText(cert.name, margin, yPosition, maxWidth, 11) + 2;
      
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      yPosition = addText(`${cert.issuer} - ${cert.date}`, margin, yPosition, maxWidth, 9) + 3;
    });
    yPosition += 5;
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    yPosition = addSectionTitle('Projets', yPosition);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    data.projects.forEach((project) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont(undefined, 'bold');
      yPosition = addText(project.name, margin, yPosition, maxWidth, 11) + 2;
      
      doc.setFont(undefined, 'normal');
      yPosition = addText(project.description, margin, yPosition, maxWidth) + 2;
      
      if (project.technologies && project.technologies.length > 0) {
        doc.setFontSize(9);
        const techText = `Technologies: ${project.technologies.join(', ')}`;
        yPosition = addText(techText, margin, yPosition, maxWidth, 9) + 3;
      }
    });
  }

  // Generate blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
}

