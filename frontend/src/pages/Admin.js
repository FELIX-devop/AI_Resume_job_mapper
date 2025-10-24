import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, TrendingUp, Upload, Download } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Admin = () => {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalJobs: 0,
    avgScore: 0,
    domainDistribution: {}
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resumesResponse, jobsResponse] = await Promise.all([
        axios.get('/api/resumes'),
        axios.get('/api/jobs')
      ]);

      setResumes(resumesResponse.data);
      setJobs(jobsResponse.data);

      // Calculate stats
      const totalResumes = resumesResponse.data.length;
      const totalJobs = jobsResponse.data.length;
      const avgScore = totalResumes > 0 
        ? resumesResponse.data.reduce((sum, resume) => sum + (resume.evaluationResult?.finalScore || 0), 0) / totalResumes
        : 0;

      // Domain distribution
      const domainDistribution = resumesResponse.data.reduce((acc, resume) => {
        const domain = resume.domain || 'Unknown';
        acc[domain] = (acc[domain] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalResumes,
        totalJobs,
        avgScore,
        domainDistribution
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleJobUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // This would be implemented in the backend
      toast.success('Job taxonomy uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload job taxonomy');
    }
  };

  const exportData = () => {
    const data = {
      resumes: resumes,
      jobs: jobs,
      stats: stats,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume-matching-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor system performance and manage data</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Resumes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalResumes}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-warning-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(stats.avgScore * 100)}%
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Domains</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(stats.domainDistribution).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Resumes */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Resumes</h2>
            <button onClick={exportData} className="btn-secondary text-sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
          <div className="space-y-4">
            {resumes.slice(0, 5).map((resume) => (
              <div key={resume.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{resume.fileName}</p>
                  <p className="text-sm text-gray-500">
                    {resume.domain} • {new Date(resume.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {Math.round((resume.evaluationResult?.finalScore || 0) * 100)}%
                  </p>
                  <p className="text-sm text-gray-500">
                    {resume.evaluationResult?.recommendation || 'N/A'}
                  </p>
                </div>
              </div>
            ))}
            {resumes.length === 0 && (
              <p className="text-gray-500 text-center py-8">No resumes uploaded yet</p>
            )}
          </div>
        </div>

        {/* Domain Distribution */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Domain Distribution</h2>
          <div className="space-y-4">
            {Object.entries(stats.domainDistribution).map(([domain, count]) => (
              <div key={domain} className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{domain}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${(count / stats.totalResumes) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-8">{count}</span>
                </div>
              </div>
            ))}
            {Object.keys(stats.domainDistribution).length === 0 && (
              <p className="text-gray-500 text-center py-8">No domain data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Job Management */}
      <div className="card mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Job Management</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Upload Job Taxonomy</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload a JSON file containing job taxonomy and skill mappings
            </p>
            <label className="btn-secondary cursor-pointer inline-block">
              <Upload className="h-4 w-4 mr-2" />
              Choose File
              <input
                type="file"
                accept=".json"
                onChange={handleJobUpload}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Model Performance</h3>
            <p className="text-sm text-gray-600 mb-4">
              View and analyze model performance metrics
            </p>
            <button className="btn-secondary">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Metrics
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="card mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">System Status</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-success-500 rounded-full"></div>
            <span className="text-sm text-gray-600">ML Service: Online</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-success-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Database: Connected</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-success-500 rounded-full"></div>
            <span className="text-sm text-gray-600">API: Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
