"use client"

import { useUsername } from "@/hooks/use-username";
import { client } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const Page = () => {
  return (
    <Suspense>
      <Lobby />
    </Suspense>
  )
}

export default Page;


function Lobby() {
  const { username } = useUsername();
  const router = useRouter();

  const searchParams = useSearchParams()
  const wasDestroyed = searchParams.get("destroyed") === "true"
  const error = searchParams.get("error")

  const { mutate: createRoom } = useMutation({
    mutationFn: async () => {
      const res = await client.room.create.post();

      if (res.status == 200) {
        router.push(`/room/${res.data?.roomId}`);
      }
    },
  })

 return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {wasDestroyed && (
          <div className="bg-red-950/50 border border-red-900 p-4 text-center">
            <p className="text-red-500 text-sm font-bold">ROOM DESTROYED</p>
            <p className="text-zinc-500 text-xs mt-1">
              All messages were permanently deleted.
            </p>
          </div>
        )}
        {(error === "room-not-found" || error === "rooom-not-found") && (
          <div className="bg-red-950/50 border border-red-900 p-4 text-center">
            <p className="text-red-500 text-sm font-bold">ROOM NOT FOUND</p>
            <p className="text-zinc-500 text-xs mt-1">
              This room may have expired or never existed.
            </p>
          </div>
        )}
        {error === "room-full" && (
          <div className="bg-red-950/50 border border-red-900 p-4 text-center">
            <p className="text-red-500 text-sm font-bold">ROOM FULL</p>
            <p className="text-zinc-500 text-xs mt-1">
              This room is at maximum capacity.
            </p>
          </div>
        )}

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-blue-500">
            {">_< "}Private_Chat
          </h1>
          <p className="text-zinc-500 text-sm">A private, self-destructing chat room.</p>
        </div>

        <div className="border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="flex items-center text-zinc-500">Your Identity</label>

              <div className="flex items-center gap-3">
                <div className="flex-1 bg-zinc-950 border border-zinc-800 p-3 text-sm text-zinc-400 font-mono">
                  {username}
                </div>
              </div>
            </div>

            <button
              onClick={() => createRoom()}
              className="w-full bg-zinc-100 text-black p-3 text-sm font-bold hover:bg-zinc-50 hover:text-black transition-colors mt-2 cursor-pointer disabled:opacity-50"
            >
              CREATE SECURE ROOM
            </button>
          </div>
        </div>
        <footer className="mt-16 text-center space-y-6 pb-12">
          <p className="text-sm text-zinc-500 uppercase tracking-widest font-mono">
            Developed by <a href="https://abinash-das.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-white font-black hover:text-blue-500 transition-colors duration-300 decoration-zinc-800 underline-offset-4 hover:underline decoration-1">Abinash Das</a>
          </p>
          
          <div className="flex items-center justify-center gap-10">
            <a 
              href="mailto:abinash.das.dev@gmail.com" 
              className="group flex items-center gap-2.5 text-xs text-zinc-400 hover:text-blue-400 transition-all duration-300 font-bold tracking-wider"
            >
              <img 
                src="/email-18-svgrepo-com.svg" 
                alt="Email" 
                className="w-4 h-4 invert opacity-70 group-hover:opacity-100 transition-opacity" 
              />
              EMAIL
            </a>
            
            <div className="w-1 h-1 rounded-full bg-zinc-800" />
            
            <a 
              href="https://github.com/AbiNash1017" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 text-xs text-zinc-400 hover:text-white transition-all duration-300 font-bold tracking-wider"
            >
              <img 
                src="/github-outline-svgrepo-com.svg" 
                alt="GitHub" 
                className="w-4 h-4 invert opacity-70 group-hover:opacity-100 transition-opacity" 
              />
              GITHUB
            </a>
          </div>
        </footer>
      </div>
    </main>
  )
}