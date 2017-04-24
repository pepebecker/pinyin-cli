#!/usr/bin/env node

'use strict'

const convertPinyin = require('pinyin-converter')
const splitPinyin = require('pinyin-split')
const ArgumentParser = require('argparse').ArgumentParser
const readline = require('readline')
const so = require('so')

var parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: false,
  description: 'Pinyin Command Line Utility'
})

parser.addArgument(['-i', '--input'],		{type: 'string'})
parser.addArgument(['-n', '--numbered'],	{action: 'storeTrue'})
parser.addArgument(['-m', '--marked'],		{action: 'storeTrue'})
parser.addArgument(['-w', '--spacing'],		{action: 'storeTrue'})
parser.addArgument(['-s', '--split'],		{action: 'storeTrue'})
parser.addArgument(['-p', '--pipe'],		{action: 'storeTrue'})
parser.addArgument(['-d', '--debug'],		{action: 'storeTrue'})

const args = parser.parseArgs()

const convert = (text, index) => new Promise((yay, nay) => {
	convertPinyin(text, {
		marked: args.marked,
		numbered: args.numbered,
		keepSpaces: args.spacing,
		debug: args.debug
	}).then((data) => {
		yay({value: data, index: index})
	}, (error) => nay('pinyin-cli -> ' + error))
})

const split = (text, index) => new Promise((yay, nay) => {
	splitPinyin(text, {debug: args.debug}).then((data) => {
		yay({value: data, index: index})
	}, (error) => nay('pinyin-cli -> ' + error))
})

const print = (text, addNewLine) => {
	if (args.pipe) {
		if (addNewLine) {
			process.stdout.write(text + '\n')
		} else {
			process.stdout.write(text)
		}
	} else {
		console.log(text)
	}
}

const printConverted = (lines, addNewLine) => {
	so(function*(){
		for (var i = 0; i < lines.length; i++) {
			yield convert(lines[i], i).then((data) => {
				const addNewLine = data.index < lines.length - 1
				print(data.value, addNewLine)
			}, console.log)
		}
	})()
}

const printSplitted = (lines, addNewLine) => {
	for (var i = 0; i < lines.length; i++) {
		split(lines[i], i).then((data) => {
			const addNewLine = data.index < lines.length - 1
			print(data.value.join(' '), addNewLine)
		})
	}
}

if (args.input) {
	if (args.split) {
		printSplitted(args.input.split('\n'))
	} else {
		printConverted(args.input.split('\n'))
	}
} else {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: false
	})

	let lines = []

	rl.on('line', function (line) {
		lines.push(line)
	})

	rl.on('close', function () {
		if (args.split) {
			printSplitted(lines)
		} else {
			printConverted(lines)
		}
	})
}
