type ShellErrorBannerProps = {
  message: string;
};

export function ShellErrorBanner({ message }: ShellErrorBannerProps): JSX.Element {
  return (
    <p role="alert" className="mb-4 font-medium text-red-700 dark:text-red-300">
      {message}
    </p>
  );
}
