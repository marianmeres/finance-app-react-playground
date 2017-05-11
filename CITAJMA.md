
# Interne poznamky, alebo hratky s reactom pokracuju...

Potrebujem este vela veci vstrebat a urcite aj nastudovat Redux a celkovo 
React-acke best practices pri vacsich aplikaciach, ale [zaver je jasny](#zaver)...

## Demo & source
http://marian.meres.sk/mmfa/public/  
https://github.com/marianmeres/finance-app-react-playground

## Lokalne spustenie
Naklonovat repozitar niekde pod ```document root``` webservera podporujuceho ```php```
a nasledne navigovat browser na dany adresar.

## Build
```npm install``` a potom najjednoduchsie sucho ```make``` pripadne ```npm run build``` . 
Vid ```package.json``` pre viac moznosti. 

Buildovacie skripty su riesene ako manualne jednoucelove kroky volane za sebou 
(vid ```package.json```), nie je tu pouzity ziaden sofistikovanejsi integrujuci 
build tool.

Poznamka: buildovanie nie je vobec testovane pod windows...

## Server a storage
Jediny server request sa robi pri logine, inak vsetky data sa citaju a zapisuju vylucne 
v localStorage, ktore je synchronne (ale implementacia simuluje chovanie asynchronne).

Poznamka k localStorage: nijak neriesim fallbackovanie... localStorage moze byt 
problematicky za istych okolnosti (user nastavenia, malo miesta na disku, 
private browsing v Safari napr. a pod...)

## Routing
Nepouzivam tu ziaden sofistikovany routing mechanizmus, vsetko sa toci okolo obycajneho
```hashchange```.

## Redux
Koncept Redux-u ma velmi zaujal, urcite sa coskoro pustim do detailnejsieho studia, 
ale nateraz umyslne celu oblast vynechavam... (aby nebolo susto prilis velke na uvod).

## Typescript
Na moje prekvapenie mi pri ```ES6``` dialekte az tak velmi TypeScript nechybal 
(ani IDE-cku), ale nechavam dvierka otvorene, potrebujem si combo TS+React
zmysluplnejsie odskusat.

## CSS
V projekte pouzivam trosku upravenu [BEM](http://getbem.com/) notaciu (v principe 
doplnenu o namespace prefix).

## Priestor na optimalizaciu
Zmyslom tohoto dema je najma osvojenie si Reactu, nehral som sa uplne s optimalizaciou
celej aplikacie... (Napr. kazdy screen si loaduje data zo storagu zakazdym nanovo, 
co urcite nie je idealne a pod...)

## Zaver

[Vsetky](http://vanilla-js.com/) 
[stare](http://jquery.com/) 
[lasky](http://backbonejs.org/), 
bolo mi potesenim, cesta spat uz nevedie.