import { Pin, PinOff } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { usePinTweet } from "@/hooks/tweets/usePinTweet";

const PinTweet = ({
  username,
  id,
  isPinned,
}: {
  username: string;
  id: number;
  isPinned: boolean;
}) => {
  const { mutate: togglePin, isPending } = usePinTweet(username);

  return (
    <DropdownMenuItem
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault();
        togglePin({ id, isPinned });
      }}
    >
      {isPinned ? <PinOff size={18} /> : <Pin size={18} />}
      {isPinned ? "Unpin from profile" : "Pin to profile"}
    </DropdownMenuItem>
  );
};

export default PinTweet;

