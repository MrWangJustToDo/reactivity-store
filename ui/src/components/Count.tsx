import { useCount } from "@/store/count";
import { shallow } from "v-r-store";

const Count1 = () => {
  const { count, change } = useCount((state) => ({
    count: state.countRef,
    change: state.changeRef,
  }), shallow);
  console.log("run");

  return (
    <div>
      <p>count1</p>
      <p>value: {count}</p>
      <button onClick={() => change(count + 1)}>add</button>
    </div>
  );
};

const Count2 = () => {
  const { countRef, changeRef, changeReactiveField, reactiveObj } = useCount();

  return (
    <div>
      <p>count2</p>
      <p>value: {countRef}</p>
      <p>reactiveObj: {reactiveObj.a.b}</p>
      <button onClick={() => changeRef(countRef + 1)}>add</button>
      <br />
      <button onClick={() => changeReactiveField(reactiveObj.a.b + 1)}>
        add reactiveObj
      </button>
    </div>
  );
};

export const Count = () => {
  return (
    <div>
      <p>reactive count example</p>
      <Count1 />
      <Count2 />
    </div>
  );
};
