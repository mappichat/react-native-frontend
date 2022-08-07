start:
	npx react-native start

install:
	rm -rf package-lock.json && rm -rf yarn.lock && rm -rf node_modules
	rm -rf ios/Podfile.lock && rm -rf ios/Pods
	npm i --legacy-peer-deps
	cd ios && pod repo update && pod update && pod install
	cat .env.staging > .env

install-production:
	rm -rf package-lock.json && rm -rf yarn.lock && rm -rf node_modules
	rm -rf ios/Podfile.lock && rm -rf ios/Pods
	npm i --legacy-peer-deps --production
	cd ios && pod repo update && pod update && pod install
	cat .env.production > .env