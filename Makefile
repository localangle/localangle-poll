USERS ?= 10
BASE_URL ?= http://localhost:3001

simulate:
	python3 scripts/simulate.py --users $(USERS) --base-url $(BASE_URL)
