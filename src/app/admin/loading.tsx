import { Loader2 } from "lucide-react";

const loading = () => {
  return (
    <div className="flex p-0 justify-center items-center ">
      <Loader2 className="size-24 animate-spin" />
    </div>
  );
};

export default loading;
