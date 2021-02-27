TARGET:=solspider

SRC_FILES := $(shell find ../.. -type  f | grep "\.go" | grep -v example  )
#SRC_FILES += main.go flag.go config_xml.go

.DEFAULT:all

all:$(TARGET) 
	@echo "Done All." 


gencodec: 
	cd ../../types; go generate

$(TARGET):$(SRC_FILES)
	go build
	@echo "Done building."


.PHONY: clean 
clean:
	rm -rf solspider
	go clean -cache
