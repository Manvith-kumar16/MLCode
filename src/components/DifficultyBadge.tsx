import type { Difficulty } from "@/data/problems";

const DifficultyBadge = ({ difficulty }: { difficulty: Difficulty }) => {
  const styles = {
    Easy: "text-easy bg-easy/10 border-easy/20",
    Medium: "text-medium bg-medium/10 border-medium/20",
    Hard: "text-hard bg-hard/10 border-hard/20",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[difficulty]}`}>
      {difficulty}
    </span>
  );
};

export default DifficultyBadge;
