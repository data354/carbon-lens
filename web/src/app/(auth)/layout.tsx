import { LogoLink } from "@/components/logo-link";
import { Copyright } from "@/components/copyright";
import authBg from "@/assets/img/auth-bg.webp";
import Image from "next/image";

export default function AuthLayout({
  children,
}: React.PropsWithChildren) {
  return (
    <div className="grid min-h-dvh w-full grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden h-full w-full p-16 lg:block">
        <Image
          src={authBg}
          alt="Image de fond des écrans d'authentification"
          className="-z-1 brightness-[0.6]"
          priority={true}
          fill={true}
        />

        <div className="flex h-full w-full flex-col justify-between">
          <LogoLink
            href="/"
            variant="white"
            className="gap-4 self-start"
            labelClassName="text-3xl font-medium"
            imgSize={52}
          />

          <p className="text-3xl text-white">
            Des données fiables pour guider les politiques
            climatiques et prioriser la conservation des
            forêts du Sénégal.
          </p>
        </div>
      </div>

      <div className="flex h-full w-full flex-col">
        <div className="flex w-full flex-1 items-center justify-center px-6 md:px-8">
          {children}
        </div>
        <div className="px-6 pt-4 pb-8 text-center md:px-8">
          <Copyright />
        </div>
      </div>
    </div>
  );
}
