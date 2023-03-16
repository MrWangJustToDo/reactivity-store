import { useCount } from "@/store/count";

const Count1 = () => {
  const { countRef, changeRef } = useCount();
  console.log("run");

  return (
    <div>
      <p>count1</p>
      <p>value: {countRef}</p>
      <button onClick={() => changeRef(countRef + 1)}>add</button>
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
