"use strict"

const Pair = function(h,t) { this.h = h; this.t = t; }

const NIL = new Pair()

const isList = (lst) => lst instanceof Pair;

const isPair = (lst) => lst instanceof Pair && lst !== NIL;

const isNil = (lst) => lst === NIL;

const isProperList = (lst) => isNil(lst) || (isPair(lst) && isProperList(cdr(lst)));

const cons = (h,t) => new Pair(h,t);

const rcons = (h,t) => new Pair(t,h);

const car = (lst) => lst.h;

const cdr = (lst) => lst.t;

const cadr = (lst) => car(cdr(lst));

const cddr = (lst) => cdr(cdr(lst));

const caar = (lst) => car(car(lst));

const foldl = (lst, f, acc) => isNil(lst) ? acc : foldl(cdr(lst), f, f(car(lst), acc));

const foldr = (lst, f, acc) => isNil(lst) ? acc : f( car(lst), foldr(cdr(lst), f, acc));

const map = (lst, f) => isNil(lst) ? NIL : foldr(lst, (v,lst_) => cons(f(v), lst_), NIL);

const filter = (lst, p) => isNil(lst) ? NIL : foldr(lst, (v,lst_) => p(v) ? cons(v,lst_) : lst_, NIL);

const mapFilter = (lst, f, p) => isNil(lst) ? NIL : foldr(lst, (v,lst_) => {const v_ = f(v); return p(v_) ? cons(v_, lst_) : lst_;}, NIL);

const filterMap = (lst, p, f) => isNil(lst) ? NIL : foldr(lst, (v,lst_) => p(v) ? cons(f(v), lst_) : lst_, NIL);

const reverse = (lst) => foldl(lst, cons, NIL);

const count = (lst, p) => foldl(lst, (v,n) => p(v) ? n+1 : n, 0);

const list = function() { return Array.prototype.reduceRight.call( arguments, rcons, NIL ); } 

const fromArray = (arr) => arr.reduceRight( rcons, NIL );

const fromObject = (obj) => Object.keys(obj).reduceRight( (acc,k) => cons(rcons(k,obj[k]),acc), NIL );

const toArray = (lst) => foldl(lst, (v,arr) => {arr.push(v); return arr}, [] );

const dojoin = (lst, sep, dot, lbr, rbr) => isNil(lst) ? "" : 
	(isList(car(lst)) ? (lbr + dojoin(car(lst), sep, dot, lbr, rbr) + rbr) : 
		(String(car(lst)))) + (isList(cdr(lst)) ? (isNil(cdr(lst)) ? "" : (sep + dojoin(cdr(lst), sep, dot, lbr, rbr))) : (dot + String(cdr(lst))));

const join = (lst, sep, dot, lbr, rbr) => (lbr||"(") + dojoin(lst, sep||" ", dot||" . ", lbr||"(", rbr||")") + (rbr||")");

const sum = (lst) => foldl(lst, (v,acc) => v + acc, 0);   

const toString = (lst, sep) => join(lst, sep);

const length = (lst) => foldl(lst, (v,acc) => acc + 1, 0);

const prependReversed = (lst,lst2) => foldl(lst2, cons, lst);

const append = (lst,lst2) => isNil(lst) ? lst2 : isNil(lst2) ? lst : reverse( prependReversed( reverse(lst), lst2));

const flatten = (lst) => isNil(lst) ? NIL : foldr(lst, (v,lst_) => isList(v) ? append(flatten(v),lst_) : cons(v,lst_), NIL);

const partition = (lst, p) => new Pair(filter(lst,p), filter(lst,(v)=>!p(v)));

const ref = (lst, i) => isNil(lst) ? NIL : i === 0 ? car(lst) : ref(cdr(lst), i-1);

const tail = (lst, i) => isNil(lst) ? NIL : i === 0 ? lst : tail(cdr(lst), i-1);

const head = (lst, i) => reverse(tail(reverse(lst), (length(lst)-i-1)));

const lt = (a, b) => a < b;

const merge = (lst1, lst2, cmp) => isNil(lst1) ? lst2 : isNil(lst2) ? lst1 : 
	(cmp||lt)(car(lst1),car(lst2)) ? 
		cons(car(lst1), merge(cdr(lst1), lst2, cmp)) :
		cons(car(lst2), merge(lst1, cdr(lst2), cmp));

const dosort = (lr, part, cmp) => isNil(part) ?
	isNil(cdr(lr)) ? car(lr) : dosort(part, lr) :
	isNil(cdr(part)) ?
		dosort(cons(car(part), lr), cdr(part)) :
		dosort(cons(merge(car(part), cadr(part), cmp), lr), cddr(part));

const sort = (lst, cmp) => dosort(NIL, map(lst, list), cmp);

const dorange = (init,limit,step) => (init === limit || step === 0 || 
	(init > limit && step > 0 ) || (limit > init && step < 0 )) ? NIL : cons(init,range(init+step,limit,step));

const range = (init,limit,step) => (!limit && !step) ? dorange(0,init,1) :
	!step ? dorange(init,limit,1) :
	dorange(init,limit,step);

const equal = (lst1, lst2) => lst1 === lst2 ||
	(isNil(lst1) && isNil(lst2)) ||  
	(isList(lst1) && isList(lst2) && equal(car(lst1), car(lst2)) && equal(cdr(lst1), cdr(lst2)));

const memq = (lst, item) => isNil(lst) ? NIL : item === car(lst) ? lst : memq(cdr(lst), item);

const assq = (lst, key) => isNil(lst) ? NIL : key === caar(lst) ? car(lst) : assq(cdr(lst), key);

const member = (lst, item) => isNil(lst) ? NIL : equal(item,car(lst)) ? lst : member(cdr(lst), item);

const assoc = (lst, key) => isNil(lst) ? NIL : equal(key, caar(lst)) ? car(lst) : assoc(cdr(lst), key);

const apply = (lst) => (car(lst).apply(this, cdr(lst).toArray()));

module.exports = {
	NIL, cons, rcons, car, cdr, cadr, cddr, caar, ref,
	foldl, foldr, map, filter, reverse, tail, head,
	filterMap, mapFilter, flatten,	prependReversed, append, partition, 
	merge, sort, range, memq, assq, member, assoc, apply, equal,
	fromArray, fromObject,
	count, list, join, toArray, sum, length, toString, isList, isPair, isNil, isProperList,
	// aliases
	reduce: foldl, reduceRight: foldr,
} 

Object.keys( module.exports )
	.forEach( (k) => Pair.prototype[k] = function() {
		Array.prototype.unshift.call(arguments, this);
		return module.exports[k].apply(this, arguments);
	})
