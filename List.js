"use strict"

const T = function(f) {
	while (f && f instanceof Function) {
		f = f.apply(f.context, f.args)
	}
	return f
}

const Pair = function(h,t) {
	this.h = h
	this.t = t
}

const NIL = new Pair()

const isList = lst => lst instanceof Pair

const isPair = lst => lst instanceof Pair && lst !== NIL

const isNil = lst => lst === NIL

const isProperList = lst => isNil(lst) || (isPair(lst) && isProperList(cdr(lst)))

const cons = (h,t) => new Pair(h,t)

const rcons = (h,t) => new Pair(t,h)

const car = lst => lst.h

const cdr = lst => lst.t

const cadr = lst => car(cdr(lst))

const cddr = lst => cdr(cdr(lst))

const caar = lst => car(car(lst))

const doReduce = (lst, f, acc) => isNil(lst) ? acc : doReduce.bind(null, cdr(lst), f, f(car(lst), acc))

const reduce = (lst, f, acc) => T(doReduce.bind(null, cdr(lst), f, f(car(lst), acc)))

const reverse = lst => reduce(lst, cons, NIL)

const reduceRight = (lst, f, acc) => reduce(reverse(lst), f, acc)

const map = (lst, f) => isNil(lst) ? NIL : reduceRight(lst, (v,lst_) => cons(f(v), lst_), NIL)

const filter = (lst, p) => isNil(lst) ? NIL : reduceRight(lst, (v,lst_) => p(v) ? cons(v,lst_) : lst_, NIL)

const mapFilter = (lst, f, p) => isNil(lst) ? NIL : reduceRight(lst, (v,lst_) => {const v_ = f(v); return p(v_) ? cons(v_, lst_) : lst_}, NIL)

const filterMap = (lst, p, f) => isNil(lst) ? NIL : reduceRight(lst, (v,lst_) => p(v) ? cons(f(v), lst_) : lst_, NIL)

const count = (lst, p) => reduce(lst, (v,n) => p(v) ? n+1 : n, 0)

const fromArray = arr => arr instanceof Array ? arr.reduceRight( (acc,v) => rcons(acc,fromArray(v)), NIL ) : arr;

const toArray = lst => reduce(lst, (v,arr) => {arr.push(v); return arr}, [] )

// TODO convert objects to associative lists?
const list = (...args) => fromArray(args)

const fromObject = obj => (obj instanceof Object && !(obj instanceof Array)) ? (Object.keys(obj).reduceRight( (acc,k) => cons(cons(k,fromObject( obj[k] )),acc), NIL )) : obj

// TODO recursive cases?
const toObject = lst => reduce(lst, (v,obj) => {obj[car(v)] = cdr(v); return obj}, {})

// TODO ugly
const doJoin = (lst, sep, dot, lbr, rbr) => isNil(lst) ? "" :
	(isList(car(lst)) ? (lbr + doJoin(car(lst), sep, dot, lbr, rbr) + rbr) :
		(String(car(lst)))) + (isList(cdr(lst)) ? (isNil(cdr(lst)) ? "" : (sep + doJoin(cdr(lst), sep, dot, lbr, rbr))) : (dot + String(cdr(lst))))

// TODO ugly
const join = (lst, sep, dot, lbr, rbr) => (lbr||"(") + doJoin(lst, sep||" ", dot||" . ", lbr||"(", rbr||")") + (rbr||")")

const sum = lst => reduce(lst, (v,acc) => v + acc, 0)   

const toString = (lst, sep) => join(lst, sep)

const length = (lst) => reduce(lst, (v,acc) => acc + 1, 0)

const prependReversed = (lst,lst2) => reduce(lst2, cons, lst)

const prepend = (lst,lst2) => prependReversed(lst,reverse(lst2))

const append = (lst,lst2) => isNil(lst) ? lst2 : isNil(lst2) ? lst : reverse( prependReversed( reverse(lst), lst2))

const flatten = lst => isNil(lst) ? NIL : reduceRight(lst, (v,lst_) => isList(v) ? append(flatten(v),lst_) : cons(v,lst_), NIL)

const partition = (lst, p) => new Pair(filter(lst,p), filter(lst,(v)=>!p(v)))

const ref = (lst, i) => isNil(lst) ? NIL : i === 0 ? car(lst) : ref(cdr(lst), i-1)

const doTail = (lst, i) => isNil(lst) || i === 0 ? lst : doTail.bind(null, cdr(lst), i-1)

const tail = (lst, i) => T(doTail.bind(null, lst, i))

const doHead = (lst, i, acc) => isNil(lst) || i === 0 ? reverse(acc) : doHead.bind(null, cdr(lst), i-1, cons(car(lst),acc))

const head = (lst, i) => T(doHead.bind(null, lst, i, NIL))

const lt = (a, b) => a < b

const merge = (lst1, lst2, cmp) => isNil(lst1) ? lst2 : isNil(lst2) ? lst1 : 
	(cmp||lt)(car(lst1),car(lst2)) ? 
		cons(car(lst1), merge(cdr(lst1), lst2, cmp)) :
		cons(car(lst2), merge(lst1, cdr(lst2), cmp))

const doSort = (lr, part, cmp) => isNil(part) ?
	isNil(cdr(lr)) ? car(lr) : doSort(part, lr, cmp) :
	isNil(cdr(part)) ?
		doSort(cons(car(part), lr), cdr(part), cmp) :
		doSort(cons(merge(car(part), cadr(part), cmp), lr), cddr(part), cmp)

const sort = (lst, cmp) => doSort(NIL, map(lst, list), cmp)

const doRange = (init,limit,step,acc) => (init === limit || step === 0 || (init > limit && step > 0 ) || (limit > init && step < 0 )) ? 
	acc : 
	doRange.bind(null,init+step,limit,step,cons(init,acc))

const range = (init,limit,step) => T(doRange.bind(null, limit === undefined ? init : limit, limit === undefined ? 0 : init, step === undefined ? -1 : -step, NIL ))

const equal = (lst1, lst2) => lst1 === lst2 ||
	(isNil(lst1) && isNil(lst2)) ||  
	(isList(lst1) && isList(lst2) && equal(car(lst1), car(lst2)) && equal(cdr(lst1), cdr(lst2)))

const memq = (lst, item) => isNil(lst) ? NIL : item === car(lst) ? lst : memq(cdr(lst), item)

const assq = (lst, key) => isNil(lst) ? NIL : key === caar(lst) ? car(lst) : assq(cdr(lst), key)

const member = (lst, item) => isNil(lst) ? NIL : equal(item,car(lst)) ? lst : member(cdr(lst), item)

const assoc = (lst, key) => isNil(lst) ? NIL : equal(key, caar(lst)) ? car(lst) : assoc(cdr(lst), key)

const apply = lst => (car(lst).apply(this, cdr(lst).toArray()))

module.exports = {
	NIL, cons, rcons, car, cdr, cadr, cddr, caar, ref,
	reduce, reduceRight, map, filter, reverse, tail, head,
	filterMap, mapFilter, flatten,	prepend, prependReversed, append, partition,
	merge, sort, range, memq, assq, member, assoc, apply, equal,
	fromArray, fromObject, toArray, toObject,
	count, list, join, sum, length, toString, isList, isPair, isNil, isProperList,
} 

Object.keys( module.exports )
	.forEach( (k) => Pair.prototype[k] = function() {
		Array.prototype.unshift.call(arguments, this)
		return module.exports[k].apply(this, arguments)
	})
