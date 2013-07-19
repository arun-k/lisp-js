function environment(outer_env,parms,args){
  this.outer=outer_env || {};
  var paramts=parms || [];
  var  argumnts=args || [];
  if(typeof paramts == 'string'){
    this[paramts]=argumnts;
  }
  else{
    for(var i=0;i<paramts.length;i++){
      this[paramts[i]]=argumnts[i]
    }
  }
  this.find=function(variable){
    if(this.hasOwnProperty(variable)){
      return this;
    }
    else{
      return this.outer.find(variable);
    }
  }
  this.update=function(dic){
    for(var key in dic){
      this[key]=dic[key];
    }
  }
}

var addglobals=function(env){
  env.update({'abs':Math.abs,'acos':Math.acos,'asin':Math.asin,'atan':Math.atan,
              'atan2':Math.atan2,'ceil':Math.ceil,'cos':Math.cos,'exp':Math.exp,
	      'floor':Math.floor,'log':Math.log,'max':Math.max,'min':Math.min,
	      'pow':Math.pow,'round':Math.round,'sin':Math.sin,'sqrt':Math.sqrt,
	      'tan':Math.tan,'random':Math.random,
	      '+':function(a,b){ return a+b; },
	      '-':function(a,b){ return a-b; },
	      '*':function(a,b){ return a*b; },
	      '/':function(a,b){ return a/b; },
	      '%':function(a,b){ return a%b; },
	      '>':function(a,b){ return a>b; },
	      '<':function(a,b){ return a<b; },
	      '>=':function(a,b){ return a>=b; },
	      '<=':function(a,b){ return a<=b; },
	      '=':function(a,b){ return a==b; },
	      'equal?':function(a,b){ return a==b; },
	      'eq?':function(a,b){ return a==b; },
	      'length':function(x){ return x.length },
	      'cons':function(x,y){ y.unshift(x); return y; },
	      'car':function(x){ return x[0]; },
	      'cdr':function(x){ return x.slice(1); },
	      'append':function(x,y){ return x.concat(y); },
	      'list?':function(x){ return typeof x === 'object' && x.constructor === Array; },
	      'null?':function(x){ return x.length == 0; },
	      'symbol?':function(x){ return typeof x === 'string'; },
	      'list':function(x){ if(typeof x === 'string'){ return x.split("");}
	                          else{ return new Array(x);}
				}
	     })
  return env;
}

var global_env = addglobals(new environment())

function eval(x,envmnt){
  var env=envmnt || global_env;
  //show(env);
  if(typeof x == 'string'){
    return env.find(x)[x];
  }
  else if(typeof x == 'number'){
    return x;
  }
  else if(x[0] == 'quote'){
    var exp=x[1];
    return exp;
  }
  else if(x[0] == 'if'){
    var test=x[1];
    var conseq=x[2];
    var alt=x[3];
    if(eval(test,env)){
      return eval(conseq)
    }
    else{
      return eval(alt)
    }
  }
  else if(x[0] == 'set!'){
    var variable=x[1];
    var exp=x[2];
    env.find(variable)[variable]=eval(exp,env)
  }
  else if(x[0] == 'define'){
    var variable=x[1];
    var exp=x[2];
    env[variable]=eval(exp,env)
  }
  else if(x[0] == 'lambda'){
    var variables=x[1];
    var exp=x[2];
    return function(args){
      return eval(exp,new environment(env,variables,args));
    };
  }
  else if(x[0] == 'begin'){
    for(var i=1;i<x.length;i++){
      val=eval(x[i],env)
    }
    return val
  }
  else{
    var exps=[];
    for(var i=0;i<x.length;i++){
      exps[i]=eval(x[i],env)
    }
    //show(exps);
    var proc=exps.shift();
    return proc.apply(null,exps);
  }
}

var read=function(s){
  return read_from(tokenize(s));
};

var parse = read;

var tokenize=function(s){
  return s.replace(/\(/g,' ( ').replace(/\)/g,' ) ').replace(/\s+/g,' ').trim().split(' ');
};

var read_from=function(tokens){
  if(tokens.length == 0){
    throw new SyntaxError("unexpected EOF while reading!!!");
  }
  var token=tokens.shift();
  if(token == '('){
    var L=[];
    while(tokens[0] != ')'){
      L.push(read_from(tokens));
    }
    tokens.shift();
    return L;
  }
  else if(token == ')'){
    throw new SyntaxError("unexpected )");
  }
  else{
    return atom(token);
  }
}

var atom=function(token){
  if(isNaN(token)){
    return token;
  }
  else{
    return +token;
  }
};

var to_string=function(exp){
  return exp.toString();
};