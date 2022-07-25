import { React } from "../../../deps.ts";

export default function Stylesheet({
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
