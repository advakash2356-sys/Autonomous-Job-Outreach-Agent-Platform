import { JobLead } from '../types';

export function exportAuditAsJSON(leads: JobLead[], adminIdentity = 'Adv.akash2356@gmail.com') {
  const exportPayload = {
    metadata: {
      exportedAt: new Date().toISOString(),
      adminIdentity,
      totalLeads: leads.length,
      formatVersion: '2.4-sovereign',
      stats: {
        drafted: leads.filter(l => l.applicationStatus === 'Drafted').length,
        sent: leads.filter(l => l.applicationStatus === 'Sent').length,
        responded: leads.filter(l => l.applicationStatus === 'Responded').length,
        initialInterviews: leads.filter(l => l.emailStatus === 'Initial Interview').length,
        noResponse: leads.filter(l => l.emailStatus === 'No Response').length,
        rejected: leads.filter(l => l.emailStatus === 'Rejected').length,
        pending: leads.filter(l => l.emailStatus === 'Pending').length,
      }
    },
    leads
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads_application_audit_${new Date().toISOString().split('T')[0]}_${Date.now().toString().slice(-4)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAuditAsCSV(leads: JobLead[]) {
  const headers = [
    'ID',
    'Recruiter Name',
    'Platform',
    'Company/Channel',
    'Contact Email',
    'Role / Topic',
    'Video or Post Title',
    'Application Status',
    'Email Status',
    'Match Score %',
    'Matched Skills',
    'Scraped At',
    'Last Updated',
    'Notes'
  ];

  const escapeCSV = (field: any) => {
    if (field === null || field === undefined) return '""';
    const stringField = Array.isArray(field) ? field.join('; ') : String(field);
    return `"${stringField.replace(/"/g, '""')}"`;
  };

  const rows = leads.map(l => [
    escapeCSV(l.id),
    escapeCSV(l.recruiterName),
    escapeCSV(l.platform),
    escapeCSV(l.companyOrChannel),
    escapeCSV(l.contactEmail),
    escapeCSV(l.roleOrTopic),
    escapeCSV(l.videoOrPostTitle),
    escapeCSV(l.applicationStatus),
    escapeCSV(l.emailStatus),
    escapeCSV(l.matchScore),
    escapeCSV(l.matchedSkills),
    escapeCSV(l.scrapedAt),
    escapeCSV(l.lastUpdated),
    escapeCSV(l.notes || '')
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads_application_audit_${new Date().toISOString().split('T')[0]}_${Date.now().toString().slice(-4)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
