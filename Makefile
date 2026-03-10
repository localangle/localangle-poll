USERS ?= 10
BASE_URL ?= http://localhost:3001

init-db:
	python3 scripts/init_db.py

clear-responses:
	python3 scripts/clear_responses.py

simulate:
	python3 scripts/simulate.py --users $(USERS) --base-url $(BASE_URL)

simulate-remote:
	python3 scripts/simulate.py --users $(USERS) --remote
