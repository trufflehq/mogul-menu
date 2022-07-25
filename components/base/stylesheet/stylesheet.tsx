import { React } from "../../../deps.ts";

export default function StyleSheet({
  url,
  children,
}: {
  url: URL;
  children: any;
}) {
  return (
    <>
      <link rel="stylesheet" href={url} />
      {children}
    </>
  );
}
