import { useMemo, useState } from 'react';
import { AdminContentService } from '../services/AdminContentService';
import { studyNotesService } from '../services/StudyNotesService';

const ACCEPTED_FILE_TYPES = '.pdf,.jpg,.jpeg,.png,.doc,.docx,.txt,.md';

function parseModuleNumber(moduleId) {
  const match = String(moduleId || '').match(/module(\d+)/i);
  return match ? Number(match[1]) : 1;
}

function createInitialForm() {
  return {
    id: '',
    scope: 'study',
    moduleId: 'module1',
    moduleTitle: 'Module 1',
    title: '',
    difficulty: 'Intermediate',
    estimatedMinutes: 15,
    objectives: '',
    sectionTitle: 'Overview',
    sectionContent: '',
    files: [],
  };
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error(`Unable to read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function parseObjectives(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map((line, index) => ({ id: `obj-${index + 1}`, title: line.trim() }))
    .filter((item) => item.title);
}

function getBlockText(block) {
  const type = String(block?.type || '').toLowerCase();

  if (type === 'paragraph') {
    return String(block?.text || block?.content || '').trim();
  }
  if (type === 'heading') {
    return String(block?.text || block?.title || '').trim();
  }
  if (type === 'callout') {
    return String(block?.content || block?.text || '').trim();
  }

  if (typeof block?.text === 'string') {
    return block.text.trim();
  }

  return JSON.stringify(block || {}, null, 2);
}

function setBlockText(block, nextText) {
  const type = String(block?.type || '').toLowerCase();
  const text = String(nextText || '').trim();

  if (type === 'paragraph') {
    return { ...block, text };
  }
  if (type === 'heading') {
    return { ...block, text };
  }
  if (type === 'callout') {
    return { ...block, content: text };
  }

  return { ...block, text };
}

function getConceptLabel(block, sectionTitle, index) {
  const type = String(block?.type || 'concept');
  const descriptor = String(block?.title || block?.text || block?.content || '').trim();
  const shortText = descriptor ? descriptor.slice(0, 60) : 'Concept';
  return `${sectionTitle || 'Section'} • ${type} ${index + 1}: ${shortText}`;
}

function LoginForm({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const ok = AdminContentService.login(username, password);
    if (!ok) {
      setError('Invalid credentials. Use admin / admin123');
      return;
    }
    setError('');
    onSuccess();
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Admin Access</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Sign in to manage study and viva content.</p>

      <form className="mt-4 space-y-3" onSubmit={submit}>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Username"
          className="h-11 w-full rounded-lg border border-white/15 bg-white/10 px-3 text-sm"
        />
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          type="password"
          className="h-11 w-full rounded-lg border border-white/15 bg-white/10 px-3 text-sm"
        />
        {error ? <p className="text-sm text-rose-500">{error}</p> : null}
        <button type="submit" className="h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-white">
          Sign In
        </button>
      </form>
    </div>
  );
}

function TopicList({ topics, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Custom Topics</h3>
      <div className="mt-3 space-y-2">
        {topics.length === 0 ? <p className="text-sm text-slate-500">No custom topics added yet.</p> : null}
        {topics.map((topic) => (
          <div key={topic.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{topic.title}</p>
            <p className="text-xs text-slate-500">{topic.id} • {topic.moduleTitle}</p>
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => onEdit(topic)} className="rounded-md border border-white/20 px-2 py-1 text-xs">
                Edit
              </button>
              <button type="button" onClick={() => onDelete(topic.id)} className="rounded-md border border-rose-300/40 px-2 py-1 text-xs text-rose-500">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(() => AdminContentService.isLoggedIn());
  const [form, setForm] = useState(createInitialForm());
  const [message, setMessage] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);
  const [existingModules, setExistingModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedConceptKey, setSelectedConceptKey] = useState('');
  const [existingScope, setExistingScope] = useState('study');
  const [editingContext, setEditingContext] = useState(null);
  const [adminsTick, setAdminsTick] = useState(0);
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const topics = useMemo(() => AdminContentService.getAllTopics(), [refreshTick]);
  const admins = useMemo(() => AdminContentService.getAdmins(), [adminsTick]);
  const selectedModule = useMemo(
    () => existingModules.find((module) => module.id === selectedModuleId) || null,
    [existingModules, selectedModuleId]
  );
  const selectableTopics = selectedModule?.topics || [];
  const selectedExistingTopic = useMemo(
    () => selectableTopics.find((topic) => topic.id === selectedTopicId) || null,
    [selectableTopics, selectedTopicId]
  );
  const selectableConcepts = useMemo(() => {
    if (!selectedExistingTopic) {
      return [];
    }

    return (selectedExistingTopic.sections || []).flatMap((section, sectionIndex) =>
      (section.content || []).map((block, contentIndex) => ({
        key: `${sectionIndex}:${contentIndex}`,
        sectionIndex,
        contentIndex,
        sectionTitle: section.title || `Section ${sectionIndex + 1}`,
        blockType: block?.type || 'concept',
        text: getBlockText(block),
        label: getConceptLabel(block, section.title || `Section ${sectionIndex + 1}`, contentIndex),
      }))
    );
  }, [selectedExistingTopic]);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onScopeChange = (scope) => {
    if (scope === 'viva') {
      setForm((prev) => ({ ...prev, scope: 'viva', moduleId: 'viva', moduleTitle: 'Viva Preparation' }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      scope: 'study',
      moduleId: `module${parseModuleNumber(prev.moduleId)}`,
      moduleTitle: prev.moduleTitle === 'Viva Preparation' ? 'Module 1' : prev.moduleTitle,
    }));
  };

  const onFileUpload = async (event) => {
    const selected = Array.from(event.target.files || []);
    const mapped = await Promise.all(
      selected.map(async (file) => ({
        id: `file-${Date.now()}-${file.name}`,
        name: file.name,
        type: file.type,
        dataUrl: await fileToDataUrl(file),
      }))
    );

    setForm((prev) => ({ ...prev, files: mapped }));
  };

  const onSubmit = (event) => {
    event.preventDefault();

    if (editingContext?.topic) {
      const updatedTopic = JSON.parse(JSON.stringify(editingContext.topic));
      const section = updatedTopic.sections?.[editingContext.sectionIndex];
      const block = section?.content?.[editingContext.contentIndex];

      if (!section || !block) {
        setMessage('Selected concept could not be updated. Please load it again.');
        return;
      }

      section.title = String(form.sectionTitle || section.title || 'Overview').trim() || 'Overview';
      section.content[editingContext.contentIndex] = setBlockText(block, form.sectionContent);

      AdminContentService.upsertStructuredTopic({
        ...updatedTopic,
        id: form.id,
        scope: form.scope,
        moduleId: form.scope === 'viva' ? 'viva' : form.moduleId,
        moduleTitle: form.scope === 'viva' ? 'Viva Preparation' : form.moduleTitle,
        title: form.title,
        difficulty: form.difficulty,
        estimatedMinutes: form.estimatedMinutes,
        learningObjectives: parseObjectives(form.objectives),
      });

      setMessage('Concept updated successfully.');
      setRefreshTick((prev) => prev + 1);
      return;
    }

    AdminContentService.upsertTopic({
      ...form,
      moduleId: form.scope === 'viva' ? 'viva' : form.moduleId,
      moduleTitle: form.scope === 'viva' ? 'Viva Preparation' : form.moduleTitle,
    });

    setMessage('Content saved. Refresh Study Notes/Viva screen to see updates.');
    setRefreshTick((prev) => prev + 1);
    setForm(createInitialForm());
    setEditingContext(null);
  };

  const onEdit = (topic) => {
    setForm({
      id: topic.id,
      scope: topic.moduleId === 'viva' ? 'viva' : 'study',
      moduleId: topic.moduleId,
      moduleTitle: topic.moduleTitle,
      title: topic.title,
      difficulty: topic.difficulty,
      estimatedMinutes: topic.estimatedMinutes,
      objectives: (topic.learningObjectives || []).map((item) => item.title).join('\n'),
      sectionTitle: topic.sections?.[0]?.title || 'Overview',
      sectionContent: topic.sections?.[0]?.content?.[0]?.text || '',
      files: (topic.relatedLinks || []).map((item) => ({ id: item.id || item.label, name: item.label, dataUrl: item.href })),
    });
    setMessage('Editing selected topic. Save to update.');
    setEditingContext(null);
  };

  const onDelete = (id) => {
    AdminContentService.deleteTopic(id);
    setRefreshTick((prev) => prev + 1);
    setMessage('Topic deleted.');
  };

  const loadExistingModules = async (scope) => {
    const tree = await studyNotesService.loadModuleTree({ scope, includeAdmin: false });
    setExistingModules(tree);
    setSelectedModuleId(tree[0]?.id || '');
    setSelectedTopicId('');
    setSelectedConceptKey('');
    setEditingContext(null);
  };

  const loadSelectedConceptIntoForm = () => {
    if (!selectedExistingTopic) {
      setMessage('Select a topic first.');
      return;
    }

    const selectedConcept = selectableConcepts.find((concept) => concept.key === selectedConceptKey);
    if (!selectedConcept) {
      setMessage('Select a concept to load.');
      return;
    }

    const scope = selectedExistingTopic.moduleId === 'viva' || String(selectedExistingTopic.id || '').startsWith('viva.') ? 'viva' : 'study';
    setForm({
      id: selectedExistingTopic.id,
      scope,
      moduleId: selectedExistingTopic.moduleId,
      moduleTitle: selectedExistingTopic.moduleTitle,
      title: selectedExistingTopic.title,
      difficulty: selectedExistingTopic.difficulty || 'Intermediate',
      estimatedMinutes: selectedExistingTopic.estimatedMinutes || 10,
      objectives: (selectedExistingTopic.learningObjectives || []).map((item) => item.title).join('\n'),
      sectionTitle: selectedConcept.sectionTitle,
      sectionContent: selectedConcept.text,
      files: (selectedExistingTopic.relatedLinks || []).map((item) => ({ id: item.id || item.label, name: item.label, dataUrl: item.href })),
    });
    setEditingContext({
      topic: selectedExistingTopic,
      sectionIndex: selectedConcept.sectionIndex,
      contentIndex: selectedConcept.contentIndex,
    });
    setMessage(`Loaded concept from ${selectedExistingTopic.id} for update.`);
  };

  const logout = () => {
    AdminContentService.logout();
    setLoggedIn(false);
  };

  const onChangePassword = (event) => {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('New password and confirm password do not match.');
      return;
    }

    const result = AdminContentService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (!result.ok) {
      setMessage(result.error || 'Unable to change password.');
      return;
    }

    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setMessage('Password updated successfully.');
  };

  const onAddAdmin = (event) => {
    event.preventDefault();
    const result = AdminContentService.addAdmin(newAdmin.username, newAdmin.password);
    if (!result.ok) {
      setMessage(result.error || 'Unable to add admin.');
      return;
    }

    setNewAdmin({ username: '', password: '' });
    setAdminsTick((prev) => prev + 1);
    setMessage('New admin added.');
  };

  const onRemoveAdmin = (username) => {
    const result = AdminContentService.removeAdmin(username);
    if (!result.ok) {
      setMessage(result.error || 'Unable to remove admin.');
      return;
    }

    setAdminsTick((prev) => prev + 1);
    setMessage(`Admin ${username} removed.`);
  };

  if (!loggedIn) {
    return <LoginForm onSuccess={() => setLoggedIn(true)} />;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Admin Content Manager</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">Add, edit, and upload content for Study Notes and Viva.</p>
          </div>
          <button type="button" onClick={logout} className="rounded-lg border border-white/20 px-3 py-2 text-sm">
            Logout
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Load Existing Material</p>
          <p className="mt-1 text-xs text-slate-500">Select module, then topic, then concept to update existing material.</p>
          <div className="mt-3 grid gap-2 md:grid-cols-[140px_auto]">
            <select
              value={existingScope}
              onChange={(event) => setExistingScope(event.target.value)}
              className="h-10 rounded-lg border border-white/15 bg-white/10 px-3 text-sm"
            >
              <option value="study">Study</option>
              <option value="viva">Viva</option>
            </select>
            <button
              type="button"
              onClick={() => loadExistingModules(existingScope)}
              className="h-10 rounded-lg border border-white/20 px-3 text-xs font-semibold"
            >
              Load Modules
            </button>
          </div>

          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <select
              value={selectedModuleId}
              onChange={(event) => {
                setSelectedModuleId(event.target.value);
                setSelectedTopicId('');
                setSelectedConceptKey('');
              }}
              className="h-10 rounded-lg border border-white/15 bg-white/10 px-3 text-sm"
            >
              <option value="">Select module...</option>
              {existingModules.map((module) => (
                <option key={module.id} value={module.id}>{module.title || module.id}</option>
              ))}
            </select>

            <select
              value={selectedTopicId}
              onChange={(event) => {
                setSelectedTopicId(event.target.value);
                setSelectedConceptKey('');
              }}
              className="h-10 rounded-lg border border-white/15 bg-white/10 px-3 text-sm"
            >
              <option value="">Select topic...</option>
              {selectableTopics.map((topic) => (
                <option key={topic.id} value={topic.id}>{topic.id} - {topic.title}</option>
              ))}
            </select>

            <select
              value={selectedConceptKey}
              onChange={(event) => setSelectedConceptKey(event.target.value)}
              className="h-10 rounded-lg border border-white/15 bg-white/10 px-3 text-sm"
            >
              <option value="">Select concept...</option>
              {selectableConcepts.map((concept) => (
                <option key={concept.key} value={concept.key}>{concept.label}</option>
              ))}
            </select>
          </div>

          <div className="mt-2 grid gap-2 md:grid-cols-[auto]">
            <button
              type="button"
              onClick={loadSelectedConceptIntoForm}
              className="h-10 rounded-lg border border-primary/30 bg-primary/10 px-3 text-xs font-semibold text-primary"
            >
              Load Selected Concept For Edit
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Scope
            <select value={form.scope} onChange={(event) => onScopeChange(event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-white/15 bg-white/10 px-3">
              <option value="study">Study Notes</option>
              <option value="viva">Viva</option>
            </select>
          </label>

          <label className="text-sm">
            Topic ID
            <input value={form.id} onChange={(event) => updateForm('id', event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-white/15 bg-white/10 px-3" placeholder={form.scope === 'viva' ? 'viva.custom-topic' : 'module1.custom-topic'} />
          </label>

          {form.scope === 'study' ? (
            <>
              <label className="text-sm">
                Module ID
                <input value={form.moduleId} onChange={(event) => updateForm('moduleId', event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-white/15 bg-white/10 px-3" placeholder="module1" />
              </label>
              <label className="text-sm">
                Module Title
                <input value={form.moduleTitle} onChange={(event) => updateForm('moduleTitle', event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-white/15 bg-white/10 px-3" placeholder="Module 1" />
              </label>
            </>
          ) : null}

          <label className="text-sm md:col-span-2">
            Topic Title
            <input value={form.title} onChange={(event) => updateForm('title', event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-white/15 bg-white/10 px-3" placeholder="Enter topic title" required />
          </label>

          <label className="text-sm">
            Difficulty
            <select value={form.difficulty} onChange={(event) => updateForm('difficulty', event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-white/15 bg-white/10 px-3">
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>

          <label className="text-sm">
            Estimated Minutes
            <input type="number" min="1" value={form.estimatedMinutes} onChange={(event) => updateForm('estimatedMinutes', Number(event.target.value || 1))} className="mt-1 h-11 w-full rounded-lg border border-white/15 bg-white/10 px-3" />
          </label>

          <label className="text-sm md:col-span-2">
            Learning Objectives (one per line)
            <textarea value={form.objectives} onChange={(event) => updateForm('objectives', event.target.value)} className="mt-1 min-h-28 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2" placeholder="Understand ...\nExplain ..." />
          </label>

          <label className="text-sm md:col-span-2">
            Section Title
            <input value={form.sectionTitle} onChange={(event) => updateForm('sectionTitle', event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-white/15 bg-white/10 px-3" />
          </label>

          <label className="text-sm md:col-span-2">
            Section Content
            <textarea value={form.sectionContent} onChange={(event) => updateForm('sectionContent', event.target.value)} className="mt-1 min-h-40 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2" placeholder="Add your content here..." />
          </label>

          <label className="text-sm md:col-span-2">
            Upload Files (PDF, JPEG, PNG, DOC, DOCX, TXT, MD)
            <input type="file" multiple accept={ACCEPTED_FILE_TYPES} onChange={onFileUpload} className="mt-1 block w-full text-sm" />
          </label>
        </div>

        {form.files.length > 0 ? (
          <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-sm font-semibold">Uploaded Files</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {form.files.map((file) => (
                <li key={file.id}>{file.name}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-4 flex items-center gap-3">
          <button type="submit" className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-white">
            {editingContext ? 'Update Concept' : 'Save Content'}
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(createInitialForm());
              setEditingContext(null);
            }}
            className="h-11 rounded-lg border border-white/20 px-4 text-sm"
          >
            Reset
          </button>
        </div>

        {message ? <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{message}</p> : null}
      </form>

      <TopicList topics={topics} onEdit={onEdit} onDelete={onDelete} />

      <form onSubmit={onChangePassword} className="rounded-2xl border border-white/10 bg-white/5 p-4 xl:col-span-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Change Admin Password</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="text-sm">
            Current Password
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
              className="mt-1 h-11 w-full rounded-lg border border-white/15 bg-white/10 px-3"
              required
            />
          </label>
          <label className="text-sm">
            New Password
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
              className="mt-1 h-11 w-full rounded-lg border border-white/15 bg-white/10 px-3"
              required
            />
          </label>
          <label className="text-sm">
            Confirm New Password
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              className="mt-1 h-11 w-full rounded-lg border border-white/15 bg-white/10 px-3"
              required
            />
          </label>
        </div>
        <button type="submit" className="mt-4 h-11 rounded-lg border border-primary/30 bg-primary/10 px-4 text-sm font-semibold text-primary">
          Update Password
        </button>
      </form>

      <form onSubmit={onAddAdmin} className="rounded-2xl border border-white/10 bg-white/5 p-4 xl:col-span-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Admin Users</h3>
        <p className="mt-1 text-xs text-slate-500">Add other admins and manage current admin accounts.</p>

        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            value={newAdmin.username}
            onChange={(event) => setNewAdmin((prev) => ({ ...prev, username: event.target.value }))}
            placeholder="New admin username"
            className="h-11 rounded-lg border border-white/15 bg-white/10 px-3 text-sm"
            required
          />
          <input
            type="password"
            value={newAdmin.password}
            onChange={(event) => setNewAdmin((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="New admin password"
            className="h-11 rounded-lg border border-white/15 bg-white/10 px-3 text-sm"
            required
          />
          <button type="submit" className="h-11 rounded-lg border border-primary/30 bg-primary/10 px-4 text-sm font-semibold text-primary">
            Add Admin
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {admins.map((admin) => (
            <div key={admin.username} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-sm text-slate-900 dark:text-slate-100">{admin.username}</p>
              <button
                type="button"
                onClick={() => onRemoveAdmin(admin.username)}
                className="rounded-md border border-rose-300/40 px-2 py-1 text-xs text-rose-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}

export default AdminPanel;
