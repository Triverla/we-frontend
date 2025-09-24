import { MetricCardProps } from "./interface";

export const MetricCard = ({ icon, label, value }: MetricCardProps) => (
  <div className="bg-white rounded-lg p-6 shadow-sm cursor-pointer">
    <div className="flex items-start gap-4">
      <div className="text-[#06A2E2]">{icon}</div>
      <div>
        <p className="text-gray-600 text-sm">{label}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
      </div>
    </div>
  </div>
);
