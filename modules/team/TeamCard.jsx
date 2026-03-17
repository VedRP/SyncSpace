/**
 * TeamCard — Displays a team with name, description, members, and color accent.
 */
import Link from "next/link";

export default function TeamCard({ team }) {
  return (
    <Link href={`/team/${team.id}`}>
      <div className="bg-[#1a1a2e] rounded-2xl border border-gray-700/30 p-5 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer group">
        {/* Color bar + name */}
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-lg font-bold"
            style={{ backgroundColor: team.color + "25", color: team.color }}
          >
            {team.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
              {team.name}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{team.description}</p>
          </div>
        </div>

        {/* Members */}
        <div className="mt-4 flex items-center justify-between">
          {/* Avatar stack */}
          <div className="flex -space-x-2">
            {team.members.slice(0, 4).map((member, i) => (
              <div
                key={member.id}
                className="w-7 h-7 rounded-full border-2 border-[#1a1a2e] overflow-hidden bg-gray-700"
                title={member.name}
                style={{ zIndex: team.members.length - i }}
              >
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              </div>
            ))}
            {team.members.length > 4 && (
              <div className="w-7 h-7 rounded-full border-2 border-[#1a1a2e] bg-gray-700 flex items-center justify-center text-[10px] text-gray-300 font-medium">
                +{team.members.length - 4}
              </div>
            )}
          </div>

          <span className="text-xs text-gray-600">
            {team.members.length} member{team.members.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}
