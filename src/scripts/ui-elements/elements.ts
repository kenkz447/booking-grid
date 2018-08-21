import styled from 'styled-components';

interface ElementProps {
    readonly size: 'small' | 'default';
}

interface LabelProps extends
    React.HTMLAttributes<HTMLLabelElement>,
    ElementProps {

}

export const Label: React.ComponentType<LabelProps> = styled.label`
    color: inherit;
`;