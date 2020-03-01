build:
	tsc --noEmit
	parcel build src/index.html -o dist/index.html --public-url '.'