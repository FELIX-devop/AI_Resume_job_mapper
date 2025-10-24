import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, BarChart3, Zap, Shield } from 'lucide-react';

const Home = () => {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          AI Resume–Job Matching
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Intelligent resume analysis and job matching powered by advanced machine learning algorithms. 
          Upload your resume and get instant, accurate job compatibility scores.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/upload" className="btn-primary text-lg px-8 py-3">
            <Upload className="inline h-5 w-5 mr-2" />
            Upload Resume
          </Link>
          <Link to="/admin" className="btn-secondary text-lg px-8 py-3">
            <BarChart3 className="inline h-5 w-5 mr-2" />
            View Analytics
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 py-16">
        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Analysis</h3>
          <p className="text-gray-600">
            Get instant resume analysis and job matching results in seconds using advanced AI models.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-6 w-6 text-success-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Accurate Matching</h3>
          <p className="text-gray-600">
            Multiple embedding models and ML algorithms ensure precise skill and experience matching.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="h-6 w-6 text-warning-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
          <p className="text-gray-600">
            Your resume data is processed securely and never shared with third parties.
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Resume</h3>
            <p className="text-gray-600">Upload your resume in PDF or DOCX format</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Job Description</h3>
            <p className="text-gray-600">Paste the job description you want to match against</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis</h3>
            <p className="text-gray-600">Our AI extracts skills, experience, and analyzes compatibility</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              4
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Results</h3>
            <p className="text-gray-600">Receive detailed matching scores and recommendations</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 rounded-2xl p-8 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Match?</h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of job seekers who have found their ideal positions using our AI-powered matching system.
        </p>
        <Link to="/upload" className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
          Start Matching Now
        </Link>
      </div>
    </div>
  );
};

export default Home;
