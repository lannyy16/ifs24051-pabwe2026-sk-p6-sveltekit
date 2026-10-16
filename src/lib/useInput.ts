export function useInput(initial = '') { let value = $state(initial); return { get value(){return value}, set value(v:string){value=v}, reset(){value=initial} }; }
