#!/usr/bin/env node

'use strict'

const convertPinyin = require('pinyin-convert')
const splitPinyin = require('pinyin-split')
const ArgumentParser = require('argparse').ArgumentParser
const readline = require('readline')
const { version } = require('./package.json')

const parser = new ArgumentParser({
  version: version,
  addHelp: false,
  description: 'Pinyin Command Line Utility'
})

parser.addArgument(['-i', '--input'],		{type: 'string'})
parser.addArgument(['-n', '--numbered'],	{action: 'storeTrue'})
parser.addArgument(['-m', '--marked'], { action: 'storeTrue' })
parser.addArgument(['-w', '--segmented'], { action: 'storeTrue' })
parser.addArgument(['-s', '--split'], { action: 'storeTrue' })
parser.addArgument(['-j', '--json'], { action: 'storeTrue' })
parser.addArgument(['-1', '--first'], { action: 'storeTrue' })
parser.addArgument(['-a', '--all'], { action: 'storeTrue' })
parser.addArgument(['-p', '--pipe'],		{action: 'storeTrue'})

const args = parser.parseArgs()

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

const printConverted = async lines => {
	for (let i in lines) {
		let data = await convertPinyin(lines[i], {
			marked: args.marked,
			numbered: args.numbered,
			segmented: args.segmented,
			everything: args.all
		})
		const addNewLine = i < lines.length - 1
		if (Array.isArray(data)) {
			if (args.json) {
				data = JSON.stringify(data)
			} else if (args.first) {
				data = data.map(l => (typeof l === 'string' ? l : l[0])).join('')
			} else {
				data = data.join('')
			}
		}
		print(data, addNewLine)
	}
}

const printSplitted = lines => {
	for (let i in lines) {
		const data = splitPinyin(lines[i], args.all, args.json)
		const addNewLine = i < lines.length - 1
		print(args.json ? data : data.join(' '), addNewLine)
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

	const lines = []

	rl.on('line', line => {
		lines.push(line)
	})

	rl.on('close', _ => {
		if (args.split) {
			printSplitted(lines)
		} else {
			printConverted(lines)
		}
	})
}
