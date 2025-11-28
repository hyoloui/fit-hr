import Link from "next/link";

export default function Home() {
  return (
    <main className="flex  py-32 px-16 justify-between items-center  bg-zinc-50 font-sans dark:bg-black sm:items-start">
      <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
        <Link href="/login" className="font-medium text-zinc-950 dark:text-zinc-50">
          Login
        </Link>
        <Link href="/signup" className="font-medium text-zinc-950 dark:text-zinc-50">
          Signup
        </Link>
      </div>
    </main>
  );
}
