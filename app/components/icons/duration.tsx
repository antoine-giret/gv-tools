import { SVGProps } from 'react';

export function DurationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M528 320c0 114.9-93.1 208-208 208s-208-93.1-208-208 93.1-208 208-208 208 93.1 208 208zm-464 0c0 141.4 114.6 256 256 256s256-114.6 256-256S461.4 64 320 64 64 178.6 64 320zm232-136v136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7 7.4-11.1 4.4-25.9-6.7-33.3L344 307.2V184c0-13.3-10.7-24-24-24s-24 10.7-24 24z"
        fill="currentColor"
      />
    </svg>
  );
}
