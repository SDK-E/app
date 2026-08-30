import { Container } from "@platform/ui/Container";
import Image from "next/image";

export function RootErrorHeader() {
  return (
    <header className="border-b border-line">
      <Container>
        <div className="flex h-[78px] items-center">
          <a
            href="/"
            className="block leading-none"
            aria-label="SDK Enterprises home"
          >
            <Image
              src="/brand/sdk-logo-light.png"
              alt="SDK Enterprises logo"
              width={300}
              height={104}
              sizes="(max-width: 768px) 156px, 180px"
              className="h-[26px] w-auto md:h-[30px]"
              priority
            />
          </a>
        </div>
      </Container>
    </header>
  );
}
