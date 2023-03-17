import{b as o,R as l,a as e,c as p}from"./chunks/index.57de4312.js";import{j as t,v as c,o as r,c as y,N as F}from"./chunks/framework.f33099f8.js";const D=F("",10),i=[D],v=JSON.parse('{"title":"How to create a Store","description":"","frontmatter":{},"headers":[],"relativePath":"create.md"}'),C={name:"create.md"},b=Object.assign(C,{setup(A){const a=`
  const useCount = RStore.createStore(() => {
    const reactiveCount = RStore.reactive({count: 0});

  return { reactiveCount };
  });

  const App = () => {
    const reactiveObj = useCount(state => state.reactiveCount);

    return <div className='container'>
      <p>React Reactive Count</p>
      <p style={{color: 'red'}}>{ reactiveObj.count }</p>
      <button className='button' onClick={() => reactiveObj.count++}>Add Button</button>
    </div>
  };

  const app1 = ReactDOM.createRoot(document.querySelector('#react-root-1'));

  app1.render(<App />);
  `,n=o.transform(a,{presets:["env","react"]});let s;return t(()=>{window.RStore=window.RStore||l,window.React=window.React||e,window.ReactDOM=window.ReactDOM||p,s=document.createElement("script"),s.innerHTML=n.code,document.head.append(s)}),c(()=>{s.remove()}),(d,u)=>(r(),y("div",null,i))}});export{v as __pageData,b as default};
