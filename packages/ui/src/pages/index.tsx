import { Inter } from "next/font/google";
import { useReactiveEffect, useReactiveState } from "reactivity-store";

import { useCount, useCount_2, useCount_3 } from "@/hooks/useCount";
import { usePosition } from "@/hooks/usePosition";
import { Count } from "@/store/Count";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { count, add, del } = useCount();

  const { x, y } = usePosition();

  const data_1 = useReactiveState({ count: 1 });

  const data_2 = useReactiveState({ count: 9 });

  useReactiveEffect(() => {
    data_2.count = data_1.count;
  });

  const {
    d: _count,
    add: _add,
    del: _del,
  } = useCount_2((state) => {
    return state.data;
  });

  return (
    <main className={`flex min-h-screen flex-col items-center p-24 ${inter.className} justify-center`}>
      <div className="w-[100px] h-[100px] border rounded-md border-red-500">
        {count}
        <br />
        <button onClick={add} className="px-[10px] py-[4px] border">
          add
        </button>
        <button onClick={del} className="px-[10px] py-[4px] border">
          del
        </button>
      </div>
      <div className="w-[100px] h-[100px] border rounded-md border-red-500">
        {_count.current.value}
        <br />
        <button onClick={_add} className="px-[10px] py-[4px] border">
          add
        </button>
        <button onClick={_del} className="px-[10px] py-[4px] border">
          del
        </button>
      </div>
      <Count>{({ count }) => count + 1}</Count>
      {x}, {y}
      <div className="w-[140px] h-[100px] border rounded-md border-purple-500">
        data_1.count: {data_1.count}
        <br />
        <button onClick={() => data_1.count++} className="px-[10px] py-[4px] border">
          add
        </button>
        <button onClick={() => data_1.count--} className="px-[10px] py-[4px] border">
          del
        </button>
        <br />
        data_2.data: {data_2.count}
      </div>
    </main>
  );
}
