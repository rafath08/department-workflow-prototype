import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Clock, GitMerge, AlertCircle, Info } from 'lucide-react';
import api from '../../services/api';

export const WorkflowConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/workflow-configs');
      if (res.data.success) {
        setConfigs(res.data.data);
      }
    } catch (err) {
      console.error('Fetch workflow configs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleToggle = (requestType, field) => {
    setConfigs((prev) =>
      prev.map((c) =>
        c.requestType === requestType ? { ...c, [field]: !c[field] } : c
      )
    );
  };

  const handleHoursChange = (requestType, value) => {
    setConfigs((prev) =>
      prev.map((c) =>
        c.requestType === requestType
          ? { ...c, autoEscalateHours: parseInt(value, 10) || 24 }
          : c
      )
    );
  };

  const handleSaveConfig = async (config) => {
    try {
      setSaving(true);
      setMessage('');
      const res = await api.put(`/admin/workflow-configs/${encodeURIComponent(config.requestType)}`, config);
      if (res.data.success) {
        setMessage(`Workflow configuration for "${config.requestType}" saved successfully.`);
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      console.error('Save workflow error:', err);
      alert(err.response?.data?.message || 'Failed to update workflow');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Workflow Rules & Approval Engine</h2>
        <p className="text-xs text-slate-500">
          Configure whether permission request categories require Faculty verification, HOD sanction, or both.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading workflow rules...</div>
      ) : (
        <div className="space-y-4">
          {configs.map((config) => (
            <div
              key={config.requestType}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <GitMerge className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">{config.requestType}</h3>
                    <p className="text-xs text-slate-400">{config.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleSaveConfig(config)}
                  disabled={saving}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto shadow-sm disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Rule
                </button>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Level 1: Faculty */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">1. Faculty Endorsement</span>
                    <button
                      type="button"
                      onClick={() => handleToggle(config.requestType, 'requiresFacultyApproval')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        config.requiresFacultyApproval ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          config.requiresFacultyApproval ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {config.requiresFacultyApproval
                      ? 'Enabled: Routed to mentor first.'
                      : 'Skipped: Directly forwarded to next stage.'}
                  </p>
                </div>

                {/* Level 2: HOD */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">2. HOD Final Sanction</span>
                    <button
                      type="button"
                      onClick={() => handleToggle(config.requestType, 'requiresHodApproval')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        config.requiresHodApproval ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          config.requiresHodApproval ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {config.requiresHodApproval
                      ? 'Enabled: Requires departmental sign-off.'
                      : 'Bypassed: Granted immediately after mentor.'}
                  </p>
                </div>

                {/* SLA / Reminders */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Reminder Timeout
                    </span>
                    <span className="font-bold text-sky-700">{config.autoEscalateHours || 48}h</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="96"
                    step="12"
                    value={config.autoEscalateHours || 48}
                    onChange={(e) => handleHoursChange(config.requestType, e.target.value)}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                  />
                  <p className="text-[11px] text-slate-400">
                    In-app reminders triggered after timeout.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowConfig;
