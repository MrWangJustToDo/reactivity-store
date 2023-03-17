import{b as o,R as e,a as l,c as p}from"./chunks/index.57de4312.js";import{j as t,v as c,o as r,c as F,N as y}from"./chunks/framework.f33099f8.js";const D=y("",8),i=[D],h=JSON.parse('{"title":"Create Store with LifeCycle ( experimental )","description":"","frontmatter":{},"headers":[],"relativePath":"createWithLifeCycle.md"}'),C={name:"createWithLifeCycle.md"},R=Object.assign(C,{setup(A){const n=`
  const useTime = RStore.createStoreWithLifeCycle(() => {
    const timeRef = RStore.ref(new Date().toString());
    const updateCountRef = RStore.ref(0);

    let id;

    RStore.onMounted(() => {
      id = setInterval(() => (timeRef.value = new Date().toString()), 1000);
    });

    RStore.onBeforeUpdate(() => updateCountRef.value++);

    RStore.onBeforeUnmount(() => {
      clearInterval(id);
    });

    return { timeRef, updateCountRef };
  });

  const App = () => {
    const { timeRef, updateCountRef } = useTime();

    return <div className='container'>
      <p>React Reactive Time</p>
      <p style={{color: 'red'}}>Time: { timeRef }</p>
      <p style={{color: 'red'}}>UpdateCount: { updateCountRef } </p>
    </div>
  };

  const app2 = ReactDOM.createRoot(document.querySelector('#react-root-2'));

  app2.render(<App />);
  `,a=o.transform(n,{presets:["env","react"]});let s;return t(()=>{window.RStore=window.RStore||e,window.React=window.React||l,window.ReactDOM=window.ReactDOM||p,s=document.createElement("script"),s.innerHTML=a.code,document.head.append(s)}),c(()=>{s.remove()}),(d,u)=>(r(),F("div",null,i))}});export{h as __pageData,R as default};
