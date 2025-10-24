import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, TrendingUp, User, Briefcase, GraduationCap } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Results = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await axios.get(`/api/resumes/${id}`);
        setResume(response.data);
      } catch (error) {
        console.error('Error fetching resume:', error);
        toast.error('Failed to load resume results');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResume();
    }
  }, [id]);

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-success-600';
    if (score >= 0.6) return 'text-warning-600';
    return 'text-danger-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 0.8) return 'bg-success-100';
    if (score >= 0.6) return 'bg-warning-100';
    return 'bg-danger-100';
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'Strong Match':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'Good Match':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'Weak Match':
        return 'bg-danger-100 text-danger-800 border-danger-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  if (!resume) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Resume Not Found</h1>
          <p className="text-gray-600 mb-8">The requested resume could not be found.</p>
          <Link to="/upload" className="btn-primary">
            Upload New Resume
          </Link>
        </div>
      </div>
    );
  }

  const evaluation = resume.evaluationResult;
  const parsed = resume.parsedEntities;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            to="/upload"
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analysis Results</h1>
            <p className="text-gray-600">{resume.fileName}</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full border ${getRecommendationColor(evaluation?.recommendation || 'Unknown')}`}>
          <span className="font-medium">{evaluation?.recommendation || 'Unknown'}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overall Score */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Overall Match Score</h2>
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(evaluation?.finalScore || 0)} mb-4`}>
                <span className={`text-4xl font-bold ${getScoreColor(evaluation?.finalScore || 0)}`}>
                  {Math.round((evaluation?.finalScore || 0) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    (evaluation?.finalScore || 0) >= 0.8 ? 'bg-success-500' :
                    (evaluation?.finalScore || 0) >= 0.6 ? 'bg-warning-500' : 'bg-danger-500'
                  }`}
                  style={{ width: `${(evaluation?.finalScore || 0) * 100}%` }}
                ></div>
              </div>
              <p className="text-gray-600">
                Best Model: <span className="font-medium">{evaluation?.bestModelName || 'N/A'}</span>
              </p>
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Detailed Analysis</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-success-600" />
                    <span className="font-medium">Skill Match</span>
                  </div>
                  <span className="font-semibold">
                    {Math.round((evaluation?.skillMatchRatio || 0) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-success-500 h-2 rounded-full"
                    style={{ width: `${(evaluation?.skillMatchRatio || 0) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5 text-primary-600" />
                    <span className="font-medium">Experience Match</span>
                  </div>
                  <span className="font-semibold">
                    {Math.round((evaluation?.experienceMatchRatio || 0) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full"
                    style={{ width: `${(evaluation?.experienceMatchRatio || 0) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5 text-warning-600" />
                    <span className="font-medium">Education Match</span>
                  </div>
                  <span className="font-semibold">
                    {Math.round((evaluation?.educationMatchRatio || 0) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-warning-500 h-2 rounded-full"
                    style={{ width: `${(evaluation?.educationMatchRatio || 0) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Text Similarity</span>
                  </div>
                  <span className="font-semibold">
                    {Math.round((Math.max(...Object.values(evaluation?.similarityScores || {})) || 0) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${(Math.max(...Object.values(evaluation?.similarityScores || {})) || 0) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Skills Analysis</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-success-700 mb-3 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Matched Skills
                </h3>
                <div className="space-y-2">
                  {(evaluation?.matchedSkills || []).map((skill, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success-600" />
                      <span className="text-sm">{skill}</span>
                    </div>
                  ))}
                  {(!evaluation?.matchedSkills || evaluation.matchedSkills.length === 0) && (
                    <p className="text-gray-500 text-sm">No matched skills found</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-danger-700 mb-3 flex items-center">
                  <XCircle className="h-4 w-4 mr-2" />
                  Missing Skills
                </h3>
                <div className="space-y-2">
                  {(evaluation?.missingSkills || []).map((skill, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-danger-600" />
                      <span className="text-sm">{skill}</span>
                    </div>
                  ))}
                  {(!evaluation?.missingSkills || evaluation.missingSkills.length === 0) && (
                    <p className="text-gray-500 text-sm">No missing skills identified</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resume Info */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Resume Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Domain</span>
                <p className="font-medium">{resume.domain}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Upload Date</span>
                <p className="font-medium">
                  {new Date(resume.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Experience</span>
                <p className="font-medium">
                  {parsed?.experienceYears || 0} years
                </p>
              </div>
            </div>
          </div>

          {/* Extracted Skills */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Extracted Skills</h2>
            <div className="flex flex-wrap gap-2">
              {(parsed?.skills || []).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
              {(!parsed?.skills || parsed.skills.length === 0) && (
                <p className="text-gray-500 text-sm">No skills extracted</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              <Link to="/upload" className="btn-primary w-full text-center block">
                Upload Another Resume
              </Link>
              <button className="btn-secondary w-full">
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
