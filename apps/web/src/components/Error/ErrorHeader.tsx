import { Container } from "@platform/ui/Container";
import Image from "next/image";
import Link from "next/link";

export function ErrorHeader({ locale }: { locale: string }) {
  return (
    <header className="border-b border-line">
      <Container>
        <div className="flex h-[78px] items-center">
          <Link
            href={`/${locale}/`}
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
          </Link>
        </div>
      </Container>
    </header>
  );
}
