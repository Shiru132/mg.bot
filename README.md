# mg.bot
Ten skrypt dla Tampermonkey automatycznie podchodzi i atakuje wybrane potwory na nowym interfejsie Margonem (NI).

Po wykryciu skrypt emituje zdarzenia myszy na odpowiedni kafel na "<canvas id="GAME_CANVAS">", kierując postać w stronę moba.

Gdy odległość między bohaterem a mobject jest mniejsza niż CLICK_OFFSET, następuje klik ppm, rozpoczynający atak.

Wszystkie interesujące ID mobów dodajesz do tablicy TARGET_IDS w sekcji konfiguracji.

Rozmiar kafla i częstotliwość skanowania można dostosować przez stałe TILE_PX i SCAN_INTERVAL.

Działa wyłącznie na nowym interfejsie gry i wymaga obecności obiektów Engine.hero, Engine.npcs oraz Engine.map.
