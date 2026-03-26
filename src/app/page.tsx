import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Vos contrats de location,{" "}
          <span className="text-green-600">en un clic.</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600">
          Fini les contrats remplis à la main. Générez et envoyez automatiquement
          vos contrats de location à vos locataires, avec les pièces jointes.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white shadow hover:bg-green-700 transition-colors"
          >
            Commencer gratuitement
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg border border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Se connecter
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">15 €/mois · Sans engagement</p>
      </div>
    </main>
  );
}
