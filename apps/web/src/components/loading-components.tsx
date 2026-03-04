import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

export const LoadingPage = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner />
    </div>
  );
};

export const LoadingComponent = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner />
    </div>
  );
};

export const LoadingButton = ({
  disabled,
  label,
  loading,
  form,
}: {
  form: string;
  label: string;
  loading: boolean;
  disabled: boolean;
}) => {
  return (
    <Button form={form} disabled={disabled || loading} type="submit">
      {loading ? <Spinner /> : label}
    </Button>
  );
};
