"use client";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "./ui/Command";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Prisma, Subreddit } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { CommandItem } from "cmdk";
import { Users } from "lucide-react";
import debounce from "lodash.debounce";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

interface SearchbarProps {}

const Searchbar: FC<SearchbarProps> = ({}) => {
  const [input, setInput] = useState<string>("");

  const router = useRouter();

  const {
    data: queryResult,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryFn: async () => {
      if (!input) return [];

      const { data } = await axios.get(`/api/search?q=${input}`);
      return data as (Subreddit & {
        _count: Prisma.SubredditCountOutputType;
      })[];
    },
    queryKey: ["search-query"],
    enabled: false,
  });

  const request = debounce(() => {
    refetch();
  },300);
  const debouncedRequest = useCallback(() => {
    request();

     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commandRef=useRef<HTMLDivElement>(null)
  const pathname=usePathname()
  useOnClickOutside(commandRef,()=>{
    setInput('')
  })
  useEffect(()=>{
    setInput('')
  },[pathname])
  return (
    <Command ref={commandRef} className="relative rounded-lg max-w-lg z-50 overflow-visible">
      <CommandInput
        value={input}
        onValueChange={(text) => {
          setInput(text);
          debouncedRequest();
        }}
        className="outline-none border-none focus:border-none focus:outline-none ring-0"
        placeholder="Search communities"
      />
      {input.length > 0 && (
        <CommandList className="absolute bg-white top-full inset-x-0 rounded-b-md shadow">
          {isFetched && <CommandEmpty>No result found.</CommandEmpty>}
          {(queryResult?.length ?? 0) > 0 ? (
            <CommandGroup heading="Communities">
              {queryResult?.map((subreddit) => (
                <CommandItem
                  key={subreddit.id}
                  onSelect={(e) => {
                    router.push(`/r/${e}`);
                    router.refresh();
                  }}
                  value={subreddit.name}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <a href={`/r/${subreddit.name}`}>r/{subreddit.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      )}
    </Command>
  );
};

export default Searchbar;
