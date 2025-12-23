import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAgent } from "../context/AgentContext";
import { Bot, Upload, FileCheck, ArrowRight, X, Database, FileSpreadsheet, FileText, Server } from "lucide-react";

export default function CreateAgent() {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [description, setDescription] = useState("");
  const [sourceType, setSourceType] = useState("pdf");
  const [files, setFiles] = useState([]);

  // Database connection fields
  const [connectionString, setConnectionString] = useState("");
  const [databaseName, setDatabaseName] = useState("");
  const [tables, setTables] = useState("");
  const [collections, setCollections] = useState("");
  const [sampleLimit, setSampleLimit] = useState("1000");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addAgent, addAgentFromSource } = useAgent();
  const navigate = useNavigate();

  const sourceTypes = [
    { id: "pdf", label: "PDF", icon: FileText, accept: ".pdf", color: "text-red-500" },
    { id: "csv", label: "CSV", icon: FileSpreadsheet, accept: ".csv", color: "text-green-500" },
    { id: "word", label: "Word", icon: FileText, accept: ".docx,.doc", color: "text-blue-500" },
    { id: "sql", label: "SQL Database", icon: Database, color: "text-purple-500" },
    { id: "nosql", label: "MongoDB", icon: Server, color: "text-orange-500" },
  ];

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (indexToRemove) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const clearAllFiles = () => {
    setFiles([]);
  };

  const getFileAccept = () => {
    const source = sourceTypes.find(s => s.id === sourceType);
    return source?.accept || "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Agent name is required");
      return;
    }
    if (!domain.trim()) {
      setError("Domain is required");
      return;
    }

    // Validate based on source type
    if (["pdf", "csv", "word"].includes(sourceType)) {
      if (!files || files.length === 0) {
        setError(`Please upload at least one ${sourceType.toUpperCase()} file`);
        return;
      }
    } else if (sourceType === "sql") {
      if (!connectionString.trim()) {
        setError("SQL connection string is required");
        return;
      }
    } else if (sourceType === "nosql") {
      if (!connectionString.trim() || !databaseName.trim()) {
        setError("MongoDB connection string and database name are required");
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      if (sourceType === "pdf") {
        // Use existing method for PDFs
        await addAgent(name, domain, description, files);
      } else {
        // Use new multi-source method
        const sourceConfig = {};

        if (["csv", "word"].includes(sourceType)) {
          sourceConfig.files = files;
        } else if (sourceType === "sql") {
          sourceConfig.connection_string = connectionString;
          sourceConfig.tables = tables ? tables.split(",").map(t => t.trim()) : null;
          sourceConfig.sample_limit = parseInt(sampleLimit) || 1000;
        } else if (sourceType === "nosql") {
          sourceConfig.connection_string = connectionString;
          sourceConfig.database = databaseName;
          sourceConfig.collections = collections ? collections.split(",").map(c => c.trim()) : null;
          sourceConfig.sample_limit = parseInt(sampleLimit) || 1000;
        }

        await addAgentFromSource(name, domain, description, sourceType, sourceConfig);
      }

      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const domains = ["Technology", "Medical", "Legal", "Finance", "Education", "Marketing"];
  const isFileSource = ["pdf", "csv", "word"].includes(sourceType);
  const isDbSource = ["sql", "nosql"].includes(sourceType);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      <div className="max-w-xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create Agent</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 ml-13">Train your AI assistant from multiple data sources</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-50 dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-8 animate-fadeIn shadow-sm">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Agent Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Agent Name
              </label>
              <input
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Sales Data Assistant"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Data Source Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Source
              </label>
              <div className="grid grid-cols-5 gap-2">
                {sourceTypes.map((source) => {
                  const Icon = source.icon;
                  return (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => {
                        setSourceType(source.id);
                        setFiles([]);
                        setConnectionString("");
                        setDatabaseName("");
                        setTables("");
                        setCollections("");
                      }}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${sourceType === source.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      disabled={loading}
                    >
                      <Icon className={`w-5 h-5 ${source.color}`} />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{source.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Domain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Domain
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {domains.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDomain(d)}
                    className={`py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${domain === d
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <input
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Or type custom domain..."
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <textarea
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
                placeholder="What will this agent help with?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* File Upload (for pdf, csv, word) */}
            {isFileSource && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {sourceType.toUpperCase()} Files
                </label>
                <div className="border border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <input
                    type="file"
                    accept={getFileAccept()}
                    multiple
                    onChange={handleFileChange}
                    disabled={loading}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Click to upload {sourceType === 'pdf' ? 'PDF' : sourceType === 'csv' ? 'CSV' : 'Word'} files
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                      {sourceType === 'pdf' ? 'Supports .pdf files' :
                        sourceType === 'csv' ? 'Supports .csv files' :
                          'Supports .doc, .docx files'}
                    </p>
                  </label>
                </div>
                {files && files.length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium text-sm">
                        <FileCheck className="w-4 h-4" />
                        {files.length} file(s) selected
                      </div>
                      <button
                        type="button"
                        onClick={clearAllFiles}
                        className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                        disabled={loading}
                      >
                        Clear all
                      </button>
                    </div>
                    <ul className="space-y-1">
                      {files.map((file, i) => (
                        <li key={i} className="flex items-center justify-between group bg-white dark:bg-gray-800 rounded px-2 py-1.5">
                          <span className="text-xs text-green-600 dark:text-green-500 truncate flex-1">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="ml-2 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            disabled={loading}
                            title="Remove file"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Database Connection (for sql, nosql) */}
            {isDbSource && (
              <div className="space-y-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Connection String
                  </label>
                  <input
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder={sourceType === "sql"
                      ? "postgresql://user:pass@localhost:5432/db"
                      : "mongodb://localhost:27017"}
                    value={connectionString}
                    onChange={(e) => setConnectionString(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {sourceType === "nosql" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Database Name
                    </label>
                    <input
                      className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="my_database"
                      value={databaseName}
                      onChange={(e) => setDatabaseName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {sourceType === "sql" ? "Tables" : "Collections"}
                    <span className="text-gray-400 font-normal ml-1">(comma-separated, leave empty for all)</span>
                  </label>
                  <input
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={sourceType === "sql" ? "users, orders, products" : "customers, transactions"}
                    value={sourceType === "sql" ? tables : collections}
                    onChange={(e) => sourceType === "sql" ? setTables(e.target.value) : setCollections(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sample Limit
                    <span className="text-gray-400 font-normal ml-1">(max rows per table)</span>
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1000"
                    value={sampleLimit}
                    onChange={(e) => setSampleLimit(e.target.value)}
                    disabled={loading}
                    min="1"
                    max="10000"
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Agent"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
