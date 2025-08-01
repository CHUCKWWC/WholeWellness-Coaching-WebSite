import{r as n,u as Y,d as W,O as J,p as f,j as e,b as l,C as x,g as S,h as A,i as I,a as v,B as P,a4 as _,Y as D,o as k,am as X}from"./index-8fIgh_68.js";import{S as L,a as O,b as B,c as F,d as y}from"./select-CXe3cxnN.js";import{F as j}from"./file-text-BnperkzY.js";import{E as Z}from"./external-link-5A8jla4e.js";import{R as ee}from"./rotate-ccw-DflyDb05.js";import{P as R}from"./play-BslN0ifO.js";import{D as se}from"./download-CIWUpICJ.js";import{I as ae}from"./image-Bi3j_pry.js";import{V as te}from"./video-DcSjyHR8.js";import"./index-CIZdKLRH.js";const re=(w,i,a)=>({"Advanced Coaching Techniques":`
## Module Overview
Master advanced coaching methodologies that transform client outcomes through evidence-based practices and innovative approaches.

### Learning Objectives
- Implement solution-focused coaching strategies
- Apply motivational interviewing techniques
- Design personalized coaching frameworks
- Master active listening and powerful questioning

### Key Topics Covered
**1. Solution-Focused Coaching (${Math.floor(a*.3)} hours)**
- Identifying client strengths and resources
- Goal-setting frameworks that drive results
- Scaling questions and miracle questions
- Building on existing client competencies

**2. Motivational Interviewing Techniques (${Math.floor(a*.3)} hours)**
- Understanding stages of change
- Resolving ambivalence and resistance
- Using reflective listening effectively
- Enhancing client motivation and commitment

**3. Advanced Communication Skills (${Math.floor(a*.4)} hours)**
- Powerful questioning techniques
- Creating safe spaces for vulnerability
- Managing challenging conversations
- Non-verbal communication mastery

### Practical Applications
- Role-playing exercises with feedback
- Case study analysis and discussion
- Technique demonstration videos
- Self-assessment tools and reflection exercises

### Professional Development
This module contributes **${a} CE credits** toward your professional certification and meets ICF core competency requirements.
    `,"Behavior Change Psychology":`
## Module Overview
Deep dive into the psychology of behavior change, habit formation, and sustainable transformation methodologies.

### Learning Objectives
- Understand neuroplasticity and behavior modification
- Apply evidence-based change models
- Design effective intervention strategies
- Support clients through change resistance

### Key Topics Covered
**1. Psychology of Change (${Math.floor(a*.25)} hours)**
- Transtheoretical Model of behavior change
- Cognitive-behavioral principles
- Neuroplasticity and brain adaptation
- Understanding change resistance

**2. Habit Formation Science (${Math.floor(a*.25)} hours)**
- The habit loop: cue, routine, reward
- Keystone habits and behavior stacking
- Environmental design for success
- Breaking unwanted patterns

**3. Motivational Psychology (${Math.floor(a*.25)} hours)**
- Self-Determination Theory
- Intrinsic vs. extrinsic motivation
- Goal-setting psychology
- Building self-efficacy

**4. Practical Applications (${Math.floor(a*.25)} hours)**
- Behavior change assessments
- Intervention design workshop
- Client case study analysis
- Progress tracking methodologies

### Professional Resources
- Behavior change assessment tools
- Client handouts and worksheets
- Research articles and evidence base
- Professional development resources
    `,"Wellness Assessment Methods":`
## Module Overview
Comprehensive training in holistic wellness assessment techniques, measurement tools, and client evaluation methodologies.

### Learning Objectives
- Conduct comprehensive wellness assessments
- Interpret assessment results effectively
- Design personalized wellness plans
- Track and measure client progress

### Key Topics Covered
**1. Holistic Assessment Frameworks (${Math.floor(a*.3)} hours)**
- Physical wellness indicators
- Mental and emotional health markers
- Social and relationship wellness
- Spiritual and purpose alignment
- Environmental and lifestyle factors

**2. Assessment Tools and Techniques (${Math.floor(a*.3)} hours)**
- Validated wellness questionnaires
- Biometric and physical assessments
- Lifestyle and habit inventories
- Stress and resilience measures
- Values and purpose assessments

**3. Data Interpretation and Planning (${Math.floor(a*.4)} hours)**
- Analyzing assessment results
- Identifying priority areas for improvement
- Creating personalized wellness plans
- Setting SMART wellness goals
- Tracking progress and outcomes

### Hands-On Practice
- Complete wellness assessments on yourself
- Practice with volunteer clients
- Interpret sample assessment results
- Design personalized wellness plans

### Professional Toolkit
Access to professional-grade assessment tools, scoring guides, and interpretation resources used by certified wellness coaches.
    `,"Client Relationship Management":`
## Module Overview
Master the art of building, maintaining, and optimizing client relationships for maximum coaching effectiveness and satisfaction.

### Learning Objectives
- Establish professional coaching relationships
- Maintain appropriate boundaries
- Handle challenging client situations
- Optimize client engagement and retention

### Key Topics Covered
**1. Relationship Foundation (${Math.floor(a*.25)} hours)**
- Creating psychological safety
- Establishing trust and rapport
- Setting clear expectations
- Professional boundary management

**2. Communication Excellence (${Math.floor(a*.25)} hours)**
- Active listening mastery
- Empathetic responding
- Difficult conversation navigation
- Cultural competency awareness

**3. Client Engagement Strategies (${Math.floor(a*.25)} hours)**
- Motivation and accountability systems
- Session structure optimization
- Between-session support
- Progress celebration methods

**4. Challenge Management (${Math.floor(a*.25)} hours)**
- Handling resistance and setbacks
- Managing client expectations
- Ethical dilemma resolution
- Professional referral processes

### Real-World Applications
- Client onboarding best practices
- Session planning templates
- Communication scripts and frameworks
- Challenge resolution case studies

This module prepares you for the complexities of professional coaching relationships while maintaining the highest ethical standards.
    `})[i]||`
## ${i}
Professional certification module covering ${i.toLowerCase()} with comprehensive learning objectives, practical applications, and hands-on exercises.

**Duration:** ${a} hours of intensive training
**Format:** Interactive online learning with assessments
**Certification:** Contributes toward professional coaching credentials

### Module Content
This comprehensive module includes theoretical foundations, practical applications, case studies, and assessment components designed to enhance your professional coaching capabilities.

### Learning Outcomes
Upon completion, you will have mastered essential skills in ${i.toLowerCase()} and be prepared to apply these techniques with confidence in your coaching practice.
  `;function pe(){const[w,i]=n.useState([]),[a,u]=n.useState(null),[h,b]=n.useState({}),[Q,q]=n.useState(!0),[E,m]=n.useState(null),[T,g]=n.useState([]),[U,$]=n.useState(!1),[C,N]=n.useState(!1);Y();const{toast:c}=W();J(),n.useEffect(()=>{M()},[]);const M=async()=>{q(!0),m(null);try{const s=await f("GET","/api/coach/certification-courses");if(s&&Array.isArray(s)){const t=[];s.forEach((r,o)=>{r.syllabus&&r.syllabus.modules&&r.syllabus.modules.forEach((d,p)=>{t.push({module_id:o*100+p+1,status:p===0?"not_started":"coming_soon",score:null,answers:{},modules:{id:o*100+p+1,title:d.title,content:re(r.title,d.title,d.duration),module_order:p+1}})})}),i(t)}else console.error("API returned non-array data:",s),i([])}catch(s){console.error("Error fetching courses:",s),m("Could not fetch certification courses."),i([])}q(!1)},G=async s=>{$(!0);try{const t=await f("GET",`/api/public/course-materials/${s}`);t.success&&t.folderUrl?(window.open(t.folderUrl,"_blank"),c({title:"Course Materials",description:`Opening ${t.courseTitle||"course"} materials in Google Drive`,variant:"default"}),g(t.materials||[])):(g([]),c({title:"Materials Access",description:t.message||"Course materials are being prepared.",variant:"default"}))}catch(t){console.error("Error accessing course materials:",t),g([]),c({title:"Error Loading Materials",description:"Failed to access course materials. Please try again.",variant:"destructive"})}$(!1)},z=async s=>{try{await f("POST","/api/coach/start-module",{moduleId:s.id,status:"in_progress"}),u(s),N(!1),M(),await G(s.id)}catch(t){console.error("Error starting module:",t),m("Could not start the module."),c({title:"Error",description:"Could not start the module. Please try again.",variant:"destructive"})}},H=async()=>{if(a)try{const t=Object.values(h).filter(d=>d==="correct").length,r=Math.round(t/2*100),o=r>=80?"completed":"failed";await f("POST","/api/coach/submit-quiz",{moduleId:a.id,score:r,answers:h,status:o}),c({title:o==="completed"?"Quiz Completed!":"Quiz Failed",description:o==="completed"?`Congratulations! You scored ${r}%`:`You scored ${r}%. You need 80% to pass.`,variant:o==="completed"?"default":"destructive"}),M(),u(null),b({}),g([]),N(!1)}catch(s){console.error("Error submitting quiz:",s),m("Could not submit your quiz results."),c({title:"Submission Failed",description:"Could not submit your quiz results. Please try again.",variant:"destructive"})}},V=s=>{switch(s){case"video":return e.jsx(te,{className:"h-4 w-4"});case"document":return e.jsx(j,{className:"h-4 w-4"});case"image":return e.jsx(ae,{className:"h-4 w-4"});default:return e.jsx(se,{className:"h-4 w-4"})}},K=s=>{switch(s){case"video":return"bg-red-100 text-red-700 border-red-200";case"document":return"bg-blue-100 text-blue-700 border-blue-200";case"image":return"bg-green-100 text-green-700 border-green-200";default:return"bg-gray-100 text-gray-700 border-gray-200"}};return Q?e.jsx("div",{className:"certification-dashboard p-6",children:e.jsx("p",{children:"Loading your progress..."})}):E?e.jsx("div",{className:"certification-dashboard p-6",children:e.jsx("p",{className:"error text-red-600",children:E})}):Array.isArray(w)?e.jsxs("div",{className:"certification-dashboard",children:[e.jsx("h1",{children:"Coach Certification Modules"}),a?e.jsxs("div",{className:"quiz-container",children:[e.jsxs("div",{className:"flex justify-between items-center mb-4",children:[e.jsxs("h2",{children:[a.title," Quiz"]}),e.jsxs("div",{className:"space-x-2",children:[e.jsxs(l,{variant:C?"default":"outline",onClick:()=>N(!C),className:"flex items-center gap-2",children:[e.jsx(j,{className:"h-4 w-4"}),"Course Materials"]}),e.jsx(l,{variant:"outline",onClick:()=>u(null),children:"Back to Modules"})]})]}),C&&e.jsxs(x,{className:"mb-6",children:[e.jsxs(S,{children:[e.jsxs(A,{className:"flex items-center gap-2",children:[e.jsx(j,{className:"h-5 w-5"}),"Course Materials"]}),e.jsx(I,{children:"Access videos, documents, and resources for this module"})]}),e.jsx(v,{children:U?e.jsxs("div",{className:"flex items-center justify-center p-4",children:[e.jsx("div",{className:"animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"}),e.jsx("span",{className:"ml-2",children:"Loading materials..."})]}):T.length>0?e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:T.map(s=>e.jsx(x,{className:"hover:shadow-md transition-shadow",children:e.jsx(v,{className:"p-4",children:e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx("div",{className:`p-2 rounded-lg border ${K(s.type)}`,children:V(s.type)}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("h4",{className:"font-medium text-sm truncate",title:s.name,children:s.name}),e.jsxs("div",{className:"flex items-center gap-2 mt-1 text-xs text-gray-500",children:[e.jsx(P,{variant:"secondary",className:"text-xs",children:s.type}),s.size&&e.jsx("span",{children:s.size})]}),e.jsxs(l,{variant:"link",size:"sm",className:"p-0 h-auto mt-2 text-xs",onClick:()=>window.open(s.url,"_blank"),children:[e.jsx(Z,{className:"h-3 w-3 mr-1"}),"Open in Google Drive"]})]})]})})},s.id))}):e.jsxs("div",{className:"text-center p-8 text-gray-500",children:[e.jsx(j,{className:"h-12 w-12 mx-auto mb-3 opacity-50"}),e.jsx("p",{className:"font-medium",children:"No course materials available"}),e.jsx("p",{className:"text-sm",children:"Course materials will appear here when Google Drive is configured"})]})})]}),e.jsx("div",{dangerouslySetInnerHTML:{__html:a.content||""}}),e.jsxs(x,{className:"mt-6",children:[e.jsxs(S,{children:[e.jsx(A,{children:"Knowledge Assessment"}),e.jsx(I,{children:"Complete the quiz to test your understanding"})]}),e.jsxs(v,{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx(_,{htmlFor:"q1",children:"Sample Question 1"}),e.jsxs(L,{value:h.q1||"",onValueChange:s=>b(t=>({...t,q1:s})),children:[e.jsx(O,{children:e.jsx(B,{placeholder:"Select Answer"})}),e.jsxs(F,{children:[e.jsx(y,{value:"correct",children:"Correct Answer"}),e.jsx(y,{value:"incorrect",children:"Incorrect Answer"})]})]})]}),e.jsxs("div",{children:[e.jsx(_,{htmlFor:"q2",children:"Sample Question 2"}),e.jsxs(L,{value:h.q2||"",onValueChange:s=>b(t=>({...t,q2:s})),children:[e.jsx(O,{children:e.jsx(B,{placeholder:"Select Answer"})}),e.jsxs(F,{children:[e.jsx(y,{value:"correct",children:"Correct Answer"}),e.jsx(y,{value:"incorrect",children:"Incorrect Answer"})]})]})]}),e.jsx("div",{className:"flex gap-2 pt-4",children:e.jsxs(l,{onClick:H,className:"flex-1",children:[e.jsx(D,{className:"h-4 w-4 mr-2"}),"Submit Quiz"]})})]})]})]}):e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:w.map(s=>{const t=()=>{switch(s.status){case"completed":return e.jsx(D,{className:"h-5 w-5 text-green-600"});case"in_progress":return e.jsx(k,{className:"h-5 w-5 text-blue-600"});case"failed":return e.jsx(X,{className:"h-5 w-5 text-red-600"});case"coming_soon":return e.jsx(k,{className:"h-5 w-5 text-gray-400"});default:return e.jsx(R,{className:"h-5 w-5 text-gray-600"})}},r=()=>{switch(s.status){case"completed":return"border-green-200 bg-green-50";case"in_progress":return"border-blue-200 bg-blue-50";case"failed":return"border-red-200 bg-red-50";case"coming_soon":return"border-gray-200 bg-gray-50";default:return"border-gray-200 bg-white"}};return e.jsxs(x,{className:`transition-all hover:shadow-lg ${r()}`,children:[e.jsxs(S,{children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx(A,{className:"text-lg",children:s.modules.title}),t()]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(P,{variant:s.status==="completed"?"default":"secondary",children:s.status.replace("_"," ").toUpperCase()}),s.score!==null&&e.jsxs(P,{variant:s.score>=80?"default":"destructive",children:[s.score,"%"]})]})]}),e.jsx(v,{children:e.jsxs("div",{className:"space-y-3",children:[e.jsxs("p",{className:"text-sm text-gray-600",children:["Module ",s.modules.module_order," - Professional Certification Course"]}),s.status==="coming_soon"?e.jsxs(l,{disabled:!0,className:"w-full",variant:"secondary",children:[e.jsx(k,{className:"h-4 w-4 mr-2"}),"Coming Soon"]}):s.status==="completed"?e.jsx("div",{className:"space-y-2",children:e.jsxs(l,{variant:"outline",className:"w-full",onClick:()=>z(s.modules),children:[e.jsx(ee,{className:"h-4 w-4 mr-2"}),"Review Module"]})}):e.jsxs(l,{className:"w-full",onClick:()=>z(s.modules),children:[e.jsx(R,{className:"h-4 w-4 mr-2"}),s.status==="in_progress"||s.status==="failed"?"Continue Module":"Start Module"]})]})})]},s.module_id)})})]}):e.jsx("div",{className:"certification-dashboard p-6",children:e.jsx("p",{className:"error text-red-600",children:"Error: Invalid data format received."})})}export{pe as default};
