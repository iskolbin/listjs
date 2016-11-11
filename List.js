const hasEqualMethod = (obj) => Object.prototype.hasOwnProperty( obj, 'equal' )

class List {
	static is( lst ) {
		return lst instanceof List
	}

	static isNil( lst ) {
		return lst === List.Nil
	}

	static of( ...col ) {
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

	static equalLists( lst1, lst2 ) {
		if ( lst1 === lst2 ) {
			return true
		} else if ( List.is( lst1 ) && List.is( lst2 )) {
			return List.equalLists( lst1.peek(), lst2.peek()) && List.equalLists( lst1.pop(), lst2.pop())
		} else if ( List.is( lst1 ) || List.is( lst2 )) {
			return false
		} else if ( hasEqualMethod( lst1 )) {
			return lst1.equal( lst2 )
		} else {
			return false
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
		let lst = this
		let ok = true
		while ( ok && !lst.isNil()) {
			[ok,acc] = f( acc, lst.peek())
			lst = lst.pop()
		}
		return acc
	}

	reduce( f, acc ) {
		let lst = this
		while ( !lst.isNil()) {
			acc = f( acc, lst.peek())
			lst = lst.pop()
		}
		return acc
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

	tail( n ) {
		let lst = this
		while ( !lst.isNil() && n-- > 0 ) {
			lst = lst.pop()
		}
		return lst
	}

	head( n ) {
		let lst = List.Nil
		let current = this
		while ( !current.isNil() && n-- > 0 ) {
			lst = lst.push( current.peek())
			current = current.pop()
		}
		return lst.reverse()
	}

	static range( init, limit, step ) {
		let lst = List.Nil
		if ( !init ) {
			return lst
		}
		if ( !limit ) {
			limit = init
			init = 0
		}
		step = !step ? (init > limit ? -1 : 1) : step
		if (((init > limit && step < 0) || (init < limit && step > 0)) && step !== 0 ) {
			if ( step < 0 ) {
				for ( let i = init; i > limit; i += step ) {
					lst = lst.push( i )
				}
			} else {
				for ( let i = init; i < limit; i += step ) {
					lst = lst.push( i )
				}
			}
		}
		return lst.reverse()
	}

	equal( lst ) {
		return List.equalLists( this, lst )
	}
}

List.Nil = new List(undefined,null)
List.Nil.t = List.Nil

module.exports = List
