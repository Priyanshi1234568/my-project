import { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

const emptyAgentForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
};

const emptyFaqForm = {
  question: "",
  answer: "",
  category: "General",
};

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [agents, setAgents] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [pendingChats, setPendingChats] = useState([]);

  const [agentForm, setAgentForm] = useState(emptyAgentForm);
  const [faqForm, setFaqForm] = useState(emptyFaqForm);
  const [selectedAgents, setSelectedAgents] = useState({});

  const [loading, setLoading] = useState(true);
  const [agentLoading, setAgentLoading] = useState(false);
  const [faqLoading, setFaqLoading] = useState(false);
  const [message, setMessage] = useState("");

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const loadData = async () => {
    setLoading(true);

    try {
      const [statsRes, agentsRes, faqsRes, pendingRes] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/agents"),
        API.get("/faqs"),
        API.get("/chat/pending"),
      ]);

      setStats(statsRes.data || null);
      setAgents(agentsRes.data || []);
      setFaqs(faqsRes.data?.faqs || []);
      setPendingChats(pendingRes.data || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateAgentForm = (field, value) => {
    setAgentForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateFaqForm = (field, value) => {
    setFaqForm((prev) => ({ ...prev, [field]: value }));
  };

  const createAgent = async (e) => {
    e.preventDefault();
    setAgentLoading(true);

    try {
      await API.post("/admin/agents", agentForm);
      setAgentForm(emptyAgentForm);
      showMessage("Agent created successfully");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create agent");
    } finally {
      setAgentLoading(false);
    }
  };

  const createFaq = async (e) => {
    e.preventDefault();
    setFaqLoading(true);

    try {
      await API.post("/faqs", faqForm);
      setFaqForm(emptyFaqForm);
      showMessage("FAQ added successfully");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create FAQ");
    } finally {
      setFaqLoading(false);
    }
  };

  const deleteFaq = async (id) => {
    const ok = window.confirm("Delete this FAQ?");
    if (!ok) return;

    try {
      await API.delete(`/faqs/${id}`);
      showMessage("FAQ deleted");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete FAQ");
    }
  };

  const deleteAgent = async (id) => {
    const ok = window.confirm("Delete this agent?");
    if (!ok) return;

    try {
      await API.delete(`/admin/agents/${id}`);
      showMessage("Agent deleted");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete agent");
    }
  };

  const assignAgent = async (conversationId) => {
    const agentId = selectedAgents[conversationId];

    if (!agentId) {
      alert("Please select an agent first");
      return;
    }

    try {
      await API.post("/chat/assign-agent", {
        conversationId,
        agentId,
      });

      showMessage("Agent assigned successfully");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign agent");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              Admin Dashboard
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Add agents, manage university FAQs, and assign pending chats.
            </p>
          </div>

          <button
            onClick={loadData}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700">
            {message}
          </div>
        )}

        {stats && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Chats" value={stats.chats?.total || 0} />
            <StatCard title="Pending Chats" value={stats.chats?.pending || 0} />
            <StatCard title="Total Agents" value={stats.agents || 0} />
            <StatCard title="Total FAQs" value={stats.faqs || 0} />
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading dashboard...
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-black text-slate-950">Add Agent</h3>
              <p className="mt-1 text-sm text-slate-500">
                Create support agents who can handle assigned chats.
              </p>

              <form onSubmit={createAgent} className="mt-5 space-y-4">
                <Input
                  label="Name"
                  value={agentForm.name}
                  onChange={(value) => updateAgentForm("name", value)}
                  placeholder="Agent name"
                />

                <Input
                  label="Email"
                  type="email"
                  value={agentForm.email}
                  onChange={(value) => updateAgentForm("email", value)}
                  placeholder="agent@example.com"
                />

                <Input
                  label="Password"
                  type="password"
                  value={agentForm.password}
                  onChange={(value) => updateAgentForm("password", value)}
                  placeholder="Minimum 6 characters"
                />

                <Input
                  label="Phone"
                  value={agentForm.phone}
                  onChange={(value) => updateAgentForm("phone", value)}
                  placeholder="+91 98765 43210"
                />

                <button
                  disabled={agentLoading}
                  className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:bg-slate-400"
                >
                  {agentLoading ? "Creating..." : "Create Agent"}
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-black text-slate-950">Add University FAQ</h3>
              <p className="mt-1 text-sm text-slate-500">
                These FAQs are checked first when a user asks a question.
              </p>

              <form onSubmit={createFaq} className="mt-5 space-y-4">
                <Input
                  label="Question"
                  value={faqForm.question}
                  onChange={(value) => updateFaqForm("question", value)}
                  placeholder="What is the admission process?"
                />

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Answer
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={faqForm.answer}
                    onChange={(e) => updateFaqForm("answer", e.target.value)}
                    placeholder="Students can apply online through the admission portal..."
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <Input
                  label="Category"
                  value={faqForm.category}
                  onChange={(value) => updateFaqForm("category", value)}
                  placeholder="Admission"
                />

                <button
                  disabled={faqLoading}
                  className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-200 hover:bg-slate-800 disabled:bg-slate-400"
                >
                  {faqLoading ? "Adding..." : "Add FAQ"}
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-950">Agents</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    List of support agents.
                  </p>
                </div>
              </div>

              {agents.length === 0 ? (
                <EmptyState text="No agents added yet." />
              ) : (
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <div
                      key={agent._id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div>
                        <p className="font-black text-slate-900">{agent.name}</p>
                        <p className="text-sm text-slate-500">{agent.email}</p>
                        <p
                          className={`mt-1 text-xs font-bold ${
                            agent.isAvailable ? "text-emerald-600" : "text-slate-400"
                          }`}
                        >
                          {agent.isAvailable ? "Available" : "Unavailable"}
                        </p>
                      </div>

                      <button
                        onClick={() => deleteAgent(agent._id)}
                        className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-xl font-black text-slate-950">University FAQs</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Bot will answer from these first.
                </p>
              </div>

              {faqs.length === 0 ? (
                <EmptyState text="No FAQs added yet." />
              ) : (
                <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {faqs.map((faq) => (
                    <div
                      key={faq._id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wide text-indigo-600">
                            {faq.category || "General"}
                          </p>
                          <p className="mt-1 font-black text-slate-900">
                            {faq.question}
                          </p>
                        </div>

                        <button
                          onClick={() => deleteFaq(faq._id)}
                          className="h-fit rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="mb-5">
                <h3 className="text-xl font-black text-slate-950">Pending Chats</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Assign unresolved conversations to agents.
                </p>
              </div>

              {pendingChats.length === 0 ? (
                <EmptyState text="No pending chats right now." />
              ) : (
                <div className="space-y-4">
                  {pendingChats.map((chat) => (
                    <div
                      key={chat._id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-sm font-black text-slate-900">
                        Session: {chat.sessionId}
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        Last message: {chat.messages?.at(-1)?.text || "No message"}
                      </p>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <select
                          value={selectedAgents[chat._id] || ""}
                          onChange={(e) =>
                            setSelectedAgents((prev) => ({
                              ...prev,
                              [chat._id]: e.target.value,
                            }))
                          }
                          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        >
                          <option value="">Select agent</option>
                          {agents.map((agent) => (
                            <option key={agent._id} value={agent._id}>
                              {agent.name} {agent.isAvailable ? "(Available)" : "(Unavailable)"}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => assignAgent(chat._id)}
                          className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white hover:bg-indigo-700"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>
      <input
        required={label !== "Phone"}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
      />
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-medium text-slate-500">
      {text}
    </div>
  );
}