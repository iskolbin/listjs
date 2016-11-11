const doReduce = (lst, f, acc) => {
	if (lst.isNil()) {
		return acc
	} else {
		return doReduce.bind( null, lst.pop(), f, f( acc, lst.peek()))
	}
}

const doReduceWhile = (lst, f, acc) => {
	if (lst.isNil()) {
		return acc
	} else {
		const [ok, newAcc] = f( acc, this.peek())
		if ( ok ) {
			return doReduceWhile.bind( null, this.pop(), f, newAcc )
		} else {
			return acc
		}
	}
}

class List {
	static T(f) {
		while (f && f instanceof Function) {
			f = f.apply(f.context, f.args)
		}
		return f
	}

	static is( lst ) {
		return lst instanceof List
	}

	static of( col ) {
		if ( col instanceof Array ) {
			return List.fromArray( col );
		} else {
			let out = List.Nil;
			for ( v of col ) {
				out = out.push( v )
			}
			return out.reverse()
		}
	}

	static fromArray( arr ) {
		if ( arr instanceof Array ) {
			return arr.reduceRight( (acc,v) => acc.push( List.fromArray( v )), List.Nil )
		} else {
			return arr
		}
	}

	toArray() {
		return this.reduce( (acc,v) =>	{acc.push( List.is(v) ? v.toArray() : v ); return acc}, [] )
	}

	constructor( h, t ) {
		this.h = h
		this.t = t
	}

	push( v ) {
		return new List( v, this )
	}

	pop() {
		return this.t
	}

	peek() {
		return this.h
	}

	isNil() {
		return this === List.Nil
	}

	isPair() {
		return !this.isNil()
	}

	isProperList() {
		if ( this.isNil()) {
			return true
		} else if ( !( List.is( this.pop()))) {
			return false
		} else {
			return this.pop().isProperList()
		}
	}

	reduceWhile( f, acc ) {
		if ( this.isNil()) {
			return acc
		} else {
			const [ok, newAcc] = f( acc, this.peek())
			if ( ok ) {
				return List.T( doReduceWhile.bind( null, this.pop(), f, newAcc ))
			} else {
				return newAcc
			}
		}
	}

	reduce( f, acc ) {
		if ( this.isNil()) {
			return acc
		} else {
			return List.T( doReduce.bind( null, this.pop(), f, f( acc, this.peek())))
		}
	}
	
	reverse() {
		return this.reduce( (acc,v) => acc.push(v), List.Nil )
	}

	reduceRight( f, acc ) {
		return this.reverse().reduce( f, acc )
	}

	mapReverse( f ) {
		return this.reduce( (acc,v) => acc.push( f(v)), List.Nil )
	}

	map( f ) {
		return this.mapReverse( f ).reverse()
	}

	filterReverse( p ) {
		return this.reduce( (acc,v) => p(v) ? acc.push(v) : acc )
	}

	filter( p ) {
		return this.filterReverse( p ).reverse()
	}

	every( p ) {
		return this.reduceWhile( (acc,v) => !p(v) ? [false,false] : [true,true], true ) 
	}

	some( p ) {
		return this.reduceWhile( (acc,v) => p(v) ? [false,true] : [true,false], false ) 
	}

	find( p ) {
		return this.reduceWhile( (acc,v) => p(v) ? [false,v] : [true,undefined], undefined )
	}

	count( p ) {
		return this.reduce( (acc,v) => p(v) ? acc + 1 : acc, 0 )
	}

	sum() {
		return this.reduce( (acc,v) => acc + v, 0 )
	}

	get length() {
		return this.count( (v) => true )
	}

	// TODO
	slice( begin, end ) {
	}

	concatReversed( lst ) {
		return this.reduce( (acc,v) => acc.push(v), lst )
	}

	concat( lst ) {
		return lst.concatReversed( this.reverse() ).reverse()
	}

	concatHead( lst ) {
		return lst.reverse().concatReversed( this )
	}

	flatten() {
		if ( this.isNil()) {
			return this
		} else {
			return this.reduceRight( (acc,v) => (List.is( v )) ? v.flatten().concat( acc ) : acc.push(v), List.Nil )
		}
	}

	partition( p ) {
		return new Pair( this.filter(p), this.filter( (v) => !p(v)))
	}

	get( index ) {
		let lst = this
		while (index-- > 0) {
			lst = lst.pop()	
		}
		return lst.peek()
	}
	
	merge( lst, cmp ) {
		if ( this.isNil()) {
			return lst 
		} else if (lst.isNil()) {
			return this;
		} else {
			if ( cmp( this.peek(), lst.peek())) {
				return new List( this.peek(), this.pop().merge( lst, cmp ))
			} else {
				return new List( lst.peek(), this.merge( lst.pop(), cmp ))
			}
		}
	}

	doSort( part, cmp ) {
		if ( part.isNil()) {
			if ( this.pop().isNil()) {
				return this.peek()
			} else {
				return part.doSort( this, cmp )
			}
		} else {
			if ( part.pop().isNil()) {
				return new List( part.peek(), this ).doSort( part.pop(), cmp )
			} else {
				return new List( part.peek().merge( part.pop().peek(), cmp ), this ).doSort( part.pop().pop(), cmp )
			}
		}
	}

	sort( cmp ) {
		cmp = !cmp ? ((a,b) => a < b) : cmp
		return List.Nil.doSort( this.map((v) => List.Nil.push(v)), cmp )
	}
}

List.Nil = new List(undefined,null)
List.Nil.t = List.Nil

module.exports = List
	/*
const doTail = (lst, i) => isNil(lst) || i === 0 ? lst : doTail.bind(null, cdr(lst), i-1)

const tail = (lst, i) => T(doTail.bind(null, lst, i))

const doHead = (lst, i, acc) => isNil(lst) || i === 0 ? reverse(acc) : doHead.bind(null, cdr(lst), i-1, cons(car(lst),acc))

const head = (lst, i) => T(doHead.bind(null, lst, i, NIL))

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
	*/
