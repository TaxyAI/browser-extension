import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Heading,
  HStack,
} from '@chakra-ui/react';
import parserHTML from 'prettier/parser-html';
import prettier from 'prettier/standalone';
import React, { useMemo } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { useAsync } from 'react-use';
import templatize from '../helpers/shrinkHTML/templatize';
import { getSimplifiedDom } from '../helpers/simplifyDom';
import CopyButton from './CopyButton';
import TokenCount from './TokenCount';

const PageContext = () => {
  const simplifiedHTML =
    useAsync(async () => (await getSimplifiedDom())?.outerHTML, []).value ?? '';
  const templatizedHTML = useMemo(() => {
    if (!simplifiedHTML) return '';
    return templatize(simplifiedHTML);
  }, [simplifiedHTML]);

  const prettySimplifiedHTML = useMemo(
    () => <PrettyHTML html={simplifiedHTML} />,
    [simplifiedHTML]
  );

  return (
    <Box>
      <Heading as="h3" size="md" my="4">
        Page Context
      </Heading>
      <Accordion allowMultiple>
        <AccordionItem>
          <Heading as="h2" size="md">
            <AccordionButton>
              <HStack flex="1">
                <Box as="span" textAlign="left">
                  Templatized HTML
                </Box>
                <CopyButton text={templatizedHTML} />
                <TokenCount html={templatizedHTML} />
              </HStack>
              <AccordionIcon />
            </AccordionButton>
          </Heading>
          <AccordionPanel pb={4} maxH="lg" overflow="scroll">
            {templatizedHTML && (
              <Box fontSize="sm">
                <pre>{templatizedHTML}</pre>
              </Box>
            )}
          </AccordionPanel>
        </AccordionItem>
        {/* Simplified HTML */}
        <AccordionItem>
          <Heading as="h2" size="md">
            <AccordionButton>
              <HStack flex="1">
                <Box as="span" textAlign="left">
                  Simplified HTML
                </Box>
                <CopyButton text={simplifiedHTML} />
                <TokenCount html={simplifiedHTML} />
              </HStack>
              <AccordionIcon />
            </AccordionButton>
          </Heading>
          <AccordionPanel pb={4} maxH="lg" overflow="scroll">
            {prettySimplifiedHTML && (
              <Box css={{ p: { marginBottom: '1em' } }}>
                {prettySimplifiedHTML}
              </Box>
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

const formatHTML = (html: string) => {
  try {
    return prettier.format(html, {
      parser: 'html',
      plugins: [parserHTML],
      htmlWhitespaceSensitivity: 'ignore',
    });
  } catch (e: any) {
    return html;
  }
};

const PrettyHTML = ({ html }: { html: string }) => {
  return (
    <SyntaxHighlighter language="htmlbars" customStyle={{ fontSize: 12 }}>
      {formatHTML(html)}
    </SyntaxHighlighter>
  );
};

export default PageContext;
