#!/bin/bash

find ./dist -name '*.js' | xargs eslint --quiet
