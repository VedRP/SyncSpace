"use client";

import { useState } from "react";

export default function ChannelDetailsDrawer({
  isOpen,
  onClose,
  conversation,
  messages = [],
  employees = [],
  onlineUsers = [],
  currentUserId,
  onAddParticipants,
  onRemoveParticipant,
  onPreviewMedia,
}) {
  const [tab, setTab] = useState("members"); // 'members' | 'media'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");

  if (!isOpen || !conversation) return null;

  const isDirect = conversation.type === "direct";
  const participants = conversation.participants || [];
  const onlineSet = new Set(onlineUsers.map((u) => String(u.userId)));

  const allAttachments = messages.reduce((acc, msg) => {
    if (msg.attachments && msg.attachments.length > 0 && !msg.isDeleted) {
      msg.attachments.forEach((att) => {
        acc.push({ ...att, messageId: msg._id, createdAt: msg.createdAt });
      });
    }
    return acc;
  }, []);

  const imageAttachments = allAttachments.filter((a) => a.fileType?.startsWith("image/"));
  const docAttachments = allAttachments.filter((a) => !a.fileType?.startsWith("image/"));

  const availableEmployees = employees.filter(
    (emp) => !participants.some((p) => String(p._id || p) === String(emp._id))
  );

  const filteredEmployees = availableEmployees.filter(
    (emp) =>
      emp.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
      emp.email?.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const handleAddMembersSubmit = async (e) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) return;
    await onAddParticipants(conversation._id, selectedUserIds);
    setSelectedUserIds([]);
    setIsAddModalOpen(false);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-gray-200 animate-slideLeft">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 truncate">
                {isDirect ? "Conversation Details" : conversation.name || "Channel Details"}
              </h3>
              <span className="text-[11px] text-gray-500 capitalize">
                {isDirect ? "Direct message" : `${conversation.type || "group"} • ${participants.length} members`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </div>

        <div className="flex border-b border-gray-200 bg-gray-50/50 p-1">
          <button
            type="button"
            onClick={() => setTab("members")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition ${
              tab === "members" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {isDirect ? "Participant" : `Members (${participants.length})`}
          </button>
          <button
            type="button"
            onClick={() => setTab("media")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition ${
              tab === "media" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Shared Files ({allAttachments.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {tab === "members" && (
            <div className="space-y-4">
              {conversation.description && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-[11px] font-semibold text-gray-500 mb-1">Topic / Description</div>
                  <div className="text-xs text-gray-800 leading-relaxed">{conversation.description}</div>
                </div>
              )}

              {!isDirect && onAddParticipants && (
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-blue-300 text-xs font-semibold text-blue-600 hover:bg-blue-50/60 transition flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Members to Channel
                </button>
              )}

              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-500 px-1">
                  {participants.length} {participants.length === 1 ? "Person" : "People"} in Chat
                </div>

                <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-xs">
                  {participants.map((p) => {
                    const pId = String(p._id || p);
                    const isMe = pId === String(currentUserId);
                    const name = p.name || (isMe ? "You" : "Colleague");
                    const email = p.email || "";
                    const isOnline = onlineSet.has(pId);
                    const initials = name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase();

                    return (
                      <div key={pId} className="p-3 flex items-center justify-between gap-3 hover:bg-gray-50/80 transition">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                              {initials}
                            </div>
                            <span
                              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                isOnline ? "bg-emerald-500" : "bg-gray-300"
                              }`}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-gray-900 truncate flex items-center gap-1.5">
                              <span>{name}</span>
                              {isMe && (
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full font-medium">
                                  You
                                </span>
                              )}
                            </div>
                            {email && <div className="text-[11px] text-gray-400 truncate">{email}</div>}
                          </div>
                        </div>

                        {!isDirect && onRemoveParticipant && participants.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove ${name} from this channel?`)) {
                                onRemoveParticipant(conversation._id, pId);
                              }
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                            title="Remove from channel"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === "media" && (
            <div className="space-y-4">
              {imageAttachments.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500">Photos & Images ({imageAttachments.length})</div>
                  <div className="grid grid-cols-3 gap-2">
                    {imageAttachments.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => onPreviewMedia(img)}
                        className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer group relative border border-gray-200 shadow-xs"
                      >
                        <img
                          src={img.url}
                          alt={img.name || "Media"}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {docAttachments.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500">Files & Documents ({docAttachments.length})</div>
                  <div className="space-y-2">
                    {docAttachments.map((doc, i) => (
                      <a
                        key={i}
                        href={doc.url}
                        download={doc.name}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-blue-50/50 border border-gray-200 rounded-xl text-xs transition shadow-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-800 truncate">{doc.name}</span>
                        </div>
                        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {allAttachments.length === 0 && (
                <div className="py-12 text-center text-gray-400 space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-gray-100 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-xs font-semibold text-gray-600">No media shared yet</div>
                  <p className="text-[11px]">Photos and files sent in this chat will appear here.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {isAddModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-1">Add Members</h4>
              <p className="text-xs text-gray-500 mb-3">Select colleagues to add to this channel.</p>

              <div className="mb-3">
                <input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search employees…"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 mb-4 divide-y divide-gray-100 border border-gray-200 rounded-xl p-1">
                {filteredEmployees.length === 0 ? (
                  <div className="p-3 text-center text-xs text-gray-400">No employees available to add</div>
                ) : (
                  filteredEmployees.map((emp) => {
                    const isSelected = selectedUserIds.includes(emp._id);
                    return (
                      <div
                        key={emp._id}
                        onClick={() => toggleUserSelection(emp._id)}
                        className={`p-2 flex items-center justify-between rounded-lg cursor-pointer transition ${
                          isSelected ? "bg-blue-50 text-blue-900" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate">{emp.name}</div>
                          <div className="text-[10px] text-gray-400 truncate">{emp.email}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded-sm text-blue-600"
                        />
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedUserIds.length === 0}
                  onClick={handleAddMembersSubmit}
                  className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  Add ({selectedUserIds.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
