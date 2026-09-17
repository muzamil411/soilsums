// Lets TypeScript treat an .mdx file as a React component module.
declare module '*.mdx' {
  import type { MDXProps } from 'mdx/types';

  export default function MDXContent(props: MDXProps): React.JSX.Element;
}
