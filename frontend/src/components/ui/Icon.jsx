import * as Icons from 'lucide-react';

const Icon = ({name, size = 20, className = ""})=>{
    const LuicdeIcon = Icons[name];
    if(!LuicdeIcon) return null;

    return <LuicdeIcon size={size} className={className}/>
}

export default Icon;