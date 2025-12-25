Folgende Upgrades sollen über die Shop gekauft werden können. Die jeweils aufgeführten Upgrades sind immer in Stufen beschrieben, die nacheinaner gekauft werden können sollen. Es muss also beispielsweise erst das Waffenupgrade Stufe 1 gekauft werden bevor Stufe 2 gekauft werden kann. Das gleiche gilt für die anderen Upgrade Arten. Es gibt keine Abhängigkeiten zwischen den Upgrade Arten, es kann also Beispielsweise sowohl Waffenupgrade als auch Speed oder Overheatprotection unabhängig voneinander upgegraded werden. Das Raumschiff ist im Standardmodus auf Stufe 0 je Upgrade Art. 

Der Shop soll im Menü auf der dritten Seite angezeigt werden. Zum Verständnis was die dritte Seite ist: 1. Seite ist der Titelbildschirm. 2. Seite ist die Auswahl aus New Game, Continue, Settings und Back to Title. Dritte Seite ist aktuell die Auswahl der Level. Die Levelauswahl verschieben wir auf eine vierte Seite, die auf der dritten Seite geöffnet werden kann durch die Auswahl:
1. Levelauswahl (führt zur Levelauswahl die aktuell noch auf Seite 3 ist) 
2. Werft (das ist der Shop zum Kauf der Upgrades)

Die Upgradeas in der Werft sollen grafisch passend dargestellt werden. AM besten wäre je Upgrade ein passendes grafisches Symbol, unter dem sich jeweils die aktuelle Stufe und die nächste Stufe darstellen lässt sowie der Preis und der aktuelle Credit Kontostand. Dann soll man es auswählen und wen man genug Credits hat, es kaufen können.
Die gekauften Upgrades sollen im localStorage gespeichert werden. Nach dem Kauf sind die Upgrades sofort verfügbar.

Folgende Auswahl soll die Werft bieten:

1. Waffenupgrade in folgenden aufeinander aufbauenden Stufen
    1. Stufe von einem Schuss auf zwei Schuss zur Zeit
    2. Stufe voh zwei Schuss auf drei Schuss zur Zeit

2. Overheat Protection, schützt die Waffe vor Überhitzung, die Überhitzungsanzeige soll sich beim Feuern langsamer füllen. 
    1. Stufe: Überhitzungsanzeige füllt sich um 15% langsamer
    2. Stufe: Überhitzungsanzeige füllt sich um 30% langsamer
    3. Stufe: Überhitzungsanzeige füllt sich um 50% langsamer

3. Speed Boost Upgrade für Beschleunigung und Maximalgeschwindigkeit
    1. Stufe: +0.2 auf den Startwert von 1.0
    2. Stufe: +0.4 auf den Startwert von 1.0
    3. Stufe: +0.6 auf den Startwert von 1.0
    4. Stufe: +0.8 auf den Startwert von 1.0
    5. Stufe: +1.0 auf den Startwert von 1.0

4. Dash System für schnellen Bewegungsimpuls (in Stufe 0 deaktiviert)
    1. Stufe: Dash System für schnellen Bewegungsimpus aktiviert

5 Schild des Raumschiffs:
    1. Schild erhöht um 20%
    2. Schild erhöht um 40%
    3. Schild erhöht um 60%
    4. Schild erhöht um 80%
    5. Schild erhöht um 100%


Credit System:
Die Credits werden äquivalend zum aktuellen Score innerhalb der Level gesammelt. Im Menü wird der Credit Kontostand nur innerhalb der Werft angezeigt. Innerhalb der Level wird er oben rechts angezeigt, dort steht bereits der Score (das sind die Credits, wir geben dem Score einfach einen anderen Namen, dann müssen wir weniger anpassen). Die Credits werden innerhalb der Level kumuliert. Wenn man in einem Level stirbt, verfallen sie nicht. Man bekommt, so wie beim Score einfach für jeden Gegner Credits. Man kann also sowohl das Level zu Ende spielen (was sich anbietet, weil der Boss mehr Scores bgringt!), man kann das Level über das Menü aber auch einfach verlassen, der Score/die Credits bleiben durch den kumulierenden Effekt einfach erhalten. Die Credits werden im LocalStorage gespeichert.
Die Upgrade Preise in der Werft steigen mit jeder Stufe. Hinterlege einen Kaufpreis, der zur Relation der erhaltenen Credits je Level passt. 

Während der level gibt es keine Pickups mehr. Sie sind komplett durch den Shop ersetzt. 

Bei New Game wird der LocalStorage geleert, es sind also levelfortschritte, upgrades und Credits weg.

